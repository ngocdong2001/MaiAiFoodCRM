import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { SettingsController } from "../controllers/settings.controller";

const router = Router();
router.use(authMiddleware);
router.get("/operating-hours", SettingsController.getOperatingHours);
router.put("/operating-hours", SettingsController.updateOperatingHours);
export default router;
