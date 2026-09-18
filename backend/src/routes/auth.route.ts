import { Router } from "express";

import { login, me, updateProfile } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { rateLimit } from "../middleware/rate-limit.middleware";

const router = Router();

// Brute-force protection: max 10 login attempts per IP per 15 minutes.
router.post("/login", rateLimit(15 * 60 * 1000, 10), login);

router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, updateProfile);

export default router;
