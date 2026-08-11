import { Router } from "express"
import {
  cancelRequest,
  getRequests,
  respondToRequest,
  sendRequest,
} from "../controllers/request.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = Router()

router.get("/api/requests", requireAuth, getRequests)
router.post("/api/requests", requireAuth, sendRequest)
router.patch("/api/requests/:id", requireAuth, respondToRequest)
router.delete("/api/requests/:id", requireAuth, cancelRequest)

export default router
