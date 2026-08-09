import { createClerkClient } from "@clerk/backend"
import { env } from "./env.js"

if (!env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is not set. Set it in backend/.env")
}

export const clerkClient = createClerkClient({ secretKey: env.CLERK_SECRET_KEY })
