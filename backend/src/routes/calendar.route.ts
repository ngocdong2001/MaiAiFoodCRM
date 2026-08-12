import { Router } from "express";
import { CalendarController } from "../controllers/calendar.controller";

const router = Router();
router.get("/options", CalendarController.getOptions);
router.get("/appointments", CalendarController.getAll);
router.post("/appointments", CalendarController.create);
router.put("/appointments/:id", CalendarController.update);
router.patch("/appointments/:id/status", CalendarController.updateStatus);
router.delete("/appointments/:id", CalendarController.delete);
export default router;