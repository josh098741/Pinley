import User from "../models/user.models.js"
import Connection from "../models/connection.models.js"

const USER_SELECT = "firstName lastName email username imageUrl pinCode lastKnownLocation"

export const getConnections = async (req, res) => {
  try {
    const clerkUserId = req.auth?.sub || req.auth?.userId
    const me = await User.findOne({ clerkUserId })
    if (!me) return res.status(404).json({ message: "User not found" })

    const connections = await Connection.find({
      $or: [{ userA: me._id }, { userB: me._id }],
    })
      .populate("userA", USER_SELECT)
      .populate("userB", USER_SELECT)
      .sort({ createdAt: -1 })

    const meId = String(me._id)
    const others = connections.map((conn) => {
      const userA = conn.userA
      const userB = conn.userB
      const other = String(userA._id || userA) === meId ? userB : userA
      return {
        ...(other && other.toObject ? other.toObject() : other),
        connectedAt: conn.createdAt,
      }
    })

    return res.status(200).json({ connections: others })
  } catch (error) {
    console.error("Error fetching connections:", error)
    return res.status(500).json({ message: "Internal server error" })
  }
}