import type { Request, Response } from "express";
import { OverviewModel } from "../models/overview.model.js";

export const OverviewController = {
  async get(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenantClient) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const data = await OverviewModel.get(req.tenantClient);
      res.json({ success: true, data });
    } catch (error) {
      console.error("OverviewController.get error:", error);
      res.status(500).json({ success: false, message: "Failed to load overview data" });
    }
  },
};
