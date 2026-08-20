import type { Request, Response } from "express";
import { ReportsModel } from "../models/reports.model.js";

export const ReportsController = {
  async getSummary(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenantClient) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const data = await ReportsModel.getSummary(req.tenantClient, {
        startDate:
          typeof req.query.startDate === "string"
            ? req.query.startDate
            : undefined,
        endDate:
          typeof req.query.endDate === "string"
            ? req.query.endDate
            : undefined,
      });
      res.json({ success: true, data });
    } catch (error) {
      console.error("ReportsController.getSummary error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to load reports data" });
    }
  },
};
