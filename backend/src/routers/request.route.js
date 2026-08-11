import { Router } from "express"
import {
  cancelRequest,
  getRequests,
  respondToRequest,
  sendRequest,
} from "../controllers/request.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"
import { rateLimit } from "../utils/rateLimit.js"

const router = Router()

router.get("/api/requests", requireAuth, getRequests)
router.post(
  "/api/requests",
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 15, message: "Too many requests. Please wait a moment." }),
  sendRequest
)
router.patch(
  "/api/requests/:id",
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 30 }),
  respondToRequest
)
router.delete(
  "/api/requests/:id",
  requireAuth,
  rateLimit({ windowMs: 60_000, max: 30 }),
  cancelRequest
)

export default router
