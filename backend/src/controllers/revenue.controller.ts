import type { Request, Response } from "express";

import { RevenueModel } from "../models/revenue.model";

const getDb = (req: Request) => req.tenantClient!;

export const RevenueController = {
  async getStaffDetail(req: Request, res: Response): Promise<void> {
    try {
      const staffId = Number.parseInt(req.params.staffId, 10);
      if (!Number.isFinite(staffId)) {
        res.status(400).json({ success: false, message: "Invalid staffId" });
        return;
      }

      const data = await RevenueModel.getStaffDetail(getDb(req), staffId, {
        startDate:
          typeof req.query.startDate === "string"
            ? req.query.startDate
            : undefined,
        endDate:
          typeof req.query.endDate === "string"
            ? req.query.endDate
            : undefined,
      });

      if (!data) {
        res.status(404).json({ success: false, message: "Staff not found" });
        return;
      }

      res.status(200).json(data);
    } catch (error) {
      console.error("RevenueController.getStaffDetail error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load staff revenue detail",
      });
    }
  },

  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const staffIdRaw = req.query.staffId;
      const staffIdValue =
        typeof staffIdRaw === "string" && staffIdRaw.trim() !== ""
          ? Number.parseInt(staffIdRaw, 10)
          : undefined;

      const data = await RevenueModel.getSummary(getDb(req), {
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
