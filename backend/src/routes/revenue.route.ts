import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { requireManagement } from "../middleware/require-role.middleware";
import { RevenueController } from "../controllers/revenue.controller";

const router = Router();

router.use(authMiddleware);

router.get("/summary", requireManagement, RevenueController.getSummary);
router.get("/staff/:staffId", requireManagement, RevenueController.getStaffDetail);
router.patch("/record/:recordId/cancel-reason", requireManagement, RevenueController.updateCancelReason);
router.patch("/record/:recordId/restore", requireManagement, RevenueController.restoreBooking);

export default router;
