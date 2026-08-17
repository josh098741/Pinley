import { Router } from "express"
import { getEvents, createEvent } from "../controllers/event.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = Router()

router.get("/api/events", requireAuth, getEvents)
router.post("/api/events", requireAuth, createEvent)

export default router
