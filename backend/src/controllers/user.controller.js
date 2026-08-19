import User from "../models/user.models.js"
import Connection from "../models/connection.models.js"
import Request from "../models/request.models.js"

const CODE_LENGTH = 8
const MAX_CODE_LENGTH = 50

const isValidCoord = (value) => typeof value === "number" && Number.isFinite(value)

export const updateLocation = async (req, res) => {
  try {
    const clerkUserId = req.auth?.sub || req.auth?.userId
    const { latitude, longitude, accuracy } = req.body

    if (!isValidCoord(latitude) || !isValidCoord(longitude)) {
      return res
        .status(400)
        .json({ message: "Valid latitude and longitude are required" })
    }

    const lastKnownLocation = {
      latitude,
      longitude,
      accuracy: isValidCoord(accuracy) ? accuracy : undefined,
      updatedAt: new Date(),
    }

    const me = await User.findOneAndUpdate(
      { clerkUserId },
      { $set: { lastKnownLocation } },
      { returnDocument: 'after', runValidators: true }
    )

    if (!me) return res.status(404).json({ message: "User not found" })

    return res.status(200).json({ lastKnownLocation: me.lastKnownLocation })
  } catch (error) {
    console.error("Error updating location:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}

const normalizeCode = (input = "") =>
  input
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, CODE_LENGTH)

export const searchUsers = async (req, res) => {
  try {
    const raw = (req.query.code || req.query.q || "").trim().slice(0, MAX_CODE_LENGTH)
    const normalized = normalizeCode(raw)

    // Strict gate: the database is never touched unless the PinCode is complete.
    if (normalized.length !== CODE_LENGTH) {
      return res
        .status(200)
        .json({ users: [], hint: "PinCodes are exactly 8 characters (e.g. AB12-CD34)." })
    }

    const clerkUserId = req.auth?.sub || req.auth?.userId
    const me = await User.findOne({ clerkUserId })
    if (!me) return res.status(404).json({ message: "User not found" })

    const users = await User.find({ pinCode: normalized }).limit(1)
    if (users.length === 0) {
      return res.status(200).json({
        users: [],
        hint: "No user has that PinCode. Double-check it and try again.",
      })
    }

    const meIdStr = String(me._id)
    const ids = users.map((u) => u._id)

    const [connections, pending] = await Promise.all([
      Connection.find({
        $or: [
          { userA: me._id, userB: { $in: ids } },
          { userA: { $in: ids }, userB: me._id },
        ],
      }),
      Request.find({
        status: "pending",
        $or: [
          { sender: me._id, recipient: { $in: ids } },
          { sender: { $in: ids }, recipient: me._id },
        ],
      }),
    ])

    const connected = new Set()
    for (const conn of connections) {
      const a = String(conn.userA)
      connected.add(a === meIdStr ? String(conn.userB) : a)
    }

    const pendingMap = new Map()
    for (const reqDoc of pending) {
      const sender = String(reqDoc.sender)
      const other = sender === meIdStr ? String(reqDoc.recipient) : sender
      if (!pendingMap.has(other)) {
        pendingMap.set(other, {
          outgoing: sender === meIdStr,
          requestId: String(reqDoc._id),
        })
      }
    }

    const results = users.map((user) => {
      const idStr = String(user._id)
      const isSelf = idStr === meIdStr

      const base = {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        imageUrl: user.imageUrl,
        // A user's PinCode is only ever shown back to themselves.
        pinCode: isSelf ? user.pinCode : null,
      }

      if (isSelf) return { ...base, relationship: "self", requestId: null }
      if (connected.has(idStr)) return { ...base, relationship: "connected", requestId: null }

      const p = pendingMap.get(idStr)
      if (p) {
        return {
          ...base,
          relationship: p.outgoing ? "pending_outgoing" : "pending_incoming",
          requestId: p.requestId,
        }
      }

      return { ...base, relationship: "none", requestId: null }
    })

    return res.status(200).json({ users: results })
  } catch (error) {
    console.error("Error searching users:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}
