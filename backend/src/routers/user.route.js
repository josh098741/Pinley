import { Router } from "express"
import { searchUsers, updateLocation, updateProfile } from "../controllers/user.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"
import { rateLimit } from "../utils/rateLimit.js"

const router = Router()

router.get(
  "/api/users/search",
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 30, message: "Searching too quickly. Please slow down." }),
  searchUsers
)

router.patch(
  "/api/users/me",
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 20, message: "Updating profile too quickly. Please slow down." }),
  updateProfile
)

router.patch(
  "/api/users/location",
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 120, message: "Updating location too quickly. Please slow down." }),
  updateLocation
)

export default router
