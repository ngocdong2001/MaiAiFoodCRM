import { Router } from "express";
import { OverviewController } from "../controllers/overview.controller.js";
import { NotificationController } from "../controllers/notification.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/stats", authMiddleware, OverviewController.get);
router.get("/queue/events", authMiddleware, OverviewController.streamQueue);
router.get("/notifications", authMiddleware, NotificationController.list);
router.patch(
	"/notifications/read-all",
	authMiddleware,
	NotificationController.markAllRead,
);

export default router;
