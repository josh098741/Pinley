import { Router } from "express"
import { searchUsers } from "../controllers/user.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"
import { rateLimit } from "../utils/rateLimit.js"

const router = Router()

router.get(
  "/api/users/search",
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 30, message: "Searching too quickly. Please slow down." }),
  searchUsers
)

export default router
