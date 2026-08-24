import { Router } from "express";
import { OverviewController } from "../controllers/overview.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", authMiddleware, OverviewController.get);
router.get("/queue/events", authMiddleware, OverviewController.streamQueue);

export default router;
