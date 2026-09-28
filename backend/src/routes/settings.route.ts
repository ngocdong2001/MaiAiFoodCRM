import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireManagement } from "../middleware/require-role.middleware";
import { SettingsController } from "../controllers/settings.controller";

const router = Router();
router.use(authMiddleware);
router.get("/operating-hours", SettingsController.getOperatingHours);
router.put(
  "/operating-hours",
  requireManagement,
  SettingsController.updateOperatingHours,
);
router.get("/salon", SettingsController.getSalonSettings);
router.put("/salon", requireManagement, SettingsController.updateSalonSettings);
router.get("/system-logs", requireManagement, SettingsController.getSystemLogs);
router.get("/users", requireManagement, SettingsController.listUsers);
router.post("/users", requireManagement, SettingsController.createUser);
router.put("/users/:id", requireManagement, SettingsController.updateUser);
router.delete("/users/:id", requireManagement, SettingsController.deleteUser);
export default router;
