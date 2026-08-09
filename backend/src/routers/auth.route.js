import { Router } from "express"
import express from "express"
import { clerkWebhook, getCurrentUser, syncUser } from "../controllers/auth.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = Router()

router.post("/webhook", express.raw({ type: "application/json" }), clerkWebhook)
router.get("/api/auth/me", requireAuth, getCurrentUser)
router.post("/api/auth/sync", requireAuth, syncUser)

export default router
