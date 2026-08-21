import { Router } from "express";
import { OverviewController } from "../controllers/overview.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", authMiddleware, OverviewController.get);

export default router;
