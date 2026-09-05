import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { RevenueController } from "../controllers/revenue.controller";

const router = Router();

router.use(authMiddleware);

router.get("/summary", RevenueController.getSummary);
router.get("/staff/:staffId", RevenueController.getStaffDetail);
router.patch("/record/:recordId/cancel-reason", RevenueController.updateCancelReason);
router.patch("/record/:recordId/restore", RevenueController.restoreBooking);

export default router;
