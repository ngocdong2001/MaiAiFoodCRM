import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { CalendarController } from "../controllers/calendar.controller";

const router = Router();
router.use(authMiddleware);
router.get("/options", CalendarController.getOptions);
router.get("/appointments", CalendarController.getAll);
router.post("/appointments", CalendarController.create);
router.put("/appointments/:id", CalendarController.update);
router.patch("/appointments/:id/status", CalendarController.updateStatus);
router.delete("/appointments/:id", CalendarController.delete);
router.get("/availability", CalendarController.getAvailability);
export default router;