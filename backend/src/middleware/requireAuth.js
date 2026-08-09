import { clerkClient } from "../utils/clerk.js"

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const token = header.slice(7)
    const payload = await clerkClient.verifyToken(token)

    req.auth = payload
    next()
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" })
  }
}
