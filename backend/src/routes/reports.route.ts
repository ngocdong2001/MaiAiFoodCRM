import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { ReportsController } from "../controllers/reports.controller.js";

const router = Router();

router.use(authMiddleware);

// GET /api/reports/summary?startDate=&endDate=
router.get("/summary", ReportsController.getSummary);

export default router;
