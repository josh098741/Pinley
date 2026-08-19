import { Router } from "express"
import { getEvent, getEvents, createEvent, inviteToEvent, deleteEvent } from "../controllers/event.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = Router()

router.get("/api/events", requireAuth, getEvents)
router.get("/api/events/:id", requireAuth, getEvent)
router.post("/api/events", requireAuth, createEvent)
router.post("/api/events/:id/invite", requireAuth, inviteToEvent)
router.delete("/api/events/:id", requireAuth, deleteEvent)

export default router
