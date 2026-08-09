import { verifyToken } from "@clerk/backend"
import { env } from "../utils/env.js"

export const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const token = header.slice(7)
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    })

    req.auth = payload
    next()
  } catch (error) {
    console.error("Authentication error in requireAuth:", error?.message || error)
    return res.status(401).json({ message: "Unauthorized" })
  }
}

