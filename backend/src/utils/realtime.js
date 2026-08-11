import { verifyToken } from "@clerk/backend"
import { env } from "./env.js"
import User from "../models/user.models.js"

let io = null

export const initRealtime = (serverIo) => {
  io = serverIo
}

export const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return
  io.to(`user:${String(userId)}`).emit(event, payload)
}

export const authSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error("Unauthorized"))

    const payload = await verifyToken(token, { secretKey: env.CLERK_SECRET_KEY })
    const clerkUserId = payload.sub || payload.userId

    const user = await User.findOne({ clerkUserId })
    if (!user) return next(new Error("User not found"))

    socket.data.userId = String(user._id)
    socket.data.clerkUserId = clerkUserId
    socket.join(`user:${socket.data.userId}`)
    next()
  } catch (error) {
    next(new Error("Unauthorized"))
  }
}

export const registerRealtimeEvents = () => {
  if (!io) return
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {})
  })
}
