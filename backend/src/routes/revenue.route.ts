import { Router } from "express";

import { RevenueController } from "../controllers/revenue.controller";

const router = Router();

router.get("/summary", RevenueController.getSummary);

export default router;
