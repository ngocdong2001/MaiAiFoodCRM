import { Router } from "express";

import { login, me, updateProfile } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/login", login);

router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, updateProfile);

export default router;
