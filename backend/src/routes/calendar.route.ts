import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireManagement } from "../middleware/require-role.middleware";
import { CalendarController } from "../controllers/calendar.controller";

const router = Router();
router.use(authMiddleware);
router.get("/options", CalendarController.getOptions);
router.get("/appointments", CalendarController.getAll);
router.post("/appointments", requireManagement, CalendarController.create);
router.put("/appointments/:id", requireManagement, CalendarController.update);
router.patch("/appointments/:id/status", requireManagement, CalendarController.updateStatus);
router.delete("/appointments/:id", requireManagement, CalendarController.delete);
router.get("/availability", CalendarController.getAvailability);
export default router;