import { Router } from "express"
import { searchUsers } from "../controllers/user.controller.js"
import { requireAuth } from "../middleware/requireAuth.js"

const router = Router()

router.get("/api/users/search", requireAuth, searchUsers)

export default router
