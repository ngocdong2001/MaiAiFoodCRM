import type { Request, Response } from "express";

import { RevenueModel } from "../models/revenue.model";

export const RevenueController = {
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const staffIdRaw = req.query.staffId;
      const staffIdValue =
        typeof staffIdRaw === "string" && staffIdRaw.trim() !== ""
          ? Number.parseInt(staffIdRaw, 10)
          : undefined;

      const data = await RevenueModel.getSummary({
        startDate:
          typeof req.query.startDate === "string"
            ? req.query.startDate
            : undefined,
        endDate:
          typeof req.query.endDate === "string" ? req.query.endDate : undefined,
        staffId: Number.isFinite(staffIdValue) ? staffIdValue : undefined,
        paymentMethod:
          typeof req.query.paymentMethod === "string"
            ? req.query.paymentMethod
            : undefined,
      });

      res.status(200).json(data);
    } catch (error) {
      console.error("RevenueController.getSummary error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load revenue summary",
      });
    }
  },
};
