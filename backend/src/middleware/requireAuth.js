import { createClerkClient } from "@clerk/backend"
import { env } from "../utils/env.js"

const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })

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
