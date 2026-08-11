import User from "../models/user.models.js"
import Connection from "../models/connection.models.js"
import Request from "../models/request.models.js"

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const relationshipFor = async (meId, otherId) => {
  if (String(meId) === String(otherId)) return { relationship: "self", requestId: null }

  const [a, b] = [String(meId), String(otherId)].sort()
  const connection = await Connection.findOne({ userA: a, userB: b })
  if (connection) return { relationship: "connected", requestId: null }

  const pending = await Request.findOne({
    status: "pending",
    $or: [
      { sender: meId, recipient: otherId },
      { sender: otherId, recipient: meId },
    ],
  })
  if (!pending) return { relationship: "none", requestId: null }

  const outgoing = String(pending.sender) === String(meId)
  return {
    relationship: outgoing ? "pending_outgoing" : "pending_incoming",
    requestId: pending._id,
  }
}

export const searchUsers = async (req, res) => {
  try {
    const raw = (req.query.q || "").trim()
    const clerkUserId = req.auth?.sub || req.auth?.userId

    const me = await User.findOne({ clerkUserId })
    if (!me) return res.status(404).json({ message: "User not found" })

    if (!raw) return res.status(200).json({ users: [] })

    const conditions = [
      { email: { $regex: escapeRegex(raw), $options: "i" } },
      { firstName: { $regex: escapeRegex(raw), $options: "i" } },
      { lastName: { $regex: escapeRegex(raw), $options: "i" } },
      { username: { $regex: escapeRegex(raw), $options: "i" } },
    ]

    const normalizedCode = raw.toUpperCase().replace(/[^A-Z0-9]/g, "")
    if (normalizedCode.length > 0) {
      conditions.push({ pinCode: { $regex: escapeRegex(normalizedCode), $options: "i" } })
    }

    const users = await User.find({ $or: conditions, _id: { $ne: me._id } }).limit(20)

    const results = []
    for (const user of users) {
      const { relationship, requestId } = await relationshipFor(me._id, user._id)
      results.push({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        imageUrl: user.imageUrl,
        pinCode: user.pinCode,
        relationship,
        requestId,
      })
    }

    return res.status(200).json({ users: results })
  } catch (error) {
    console.error("Error searching users:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
