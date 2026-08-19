import { Router } from "express"
import { getEvents, createEvent, inviteToEvent } from "../controllers/event.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = Router()

router.get("/api/events", requireAuth, getEvents)
router.post("/api/events", requireAuth, createEvent)
router.post("/api/events/:id/invite", requireAuth, inviteToEvent)

export default router
