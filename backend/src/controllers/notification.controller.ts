import type { Request, Response } from "express";
import { NotificationModel } from "../models/notification.model.js";

export const NotificationController = {
  async list(req: Request, res: Response): Promise<void> {
    if (!req.tenantClient) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const data = await NotificationModel.list(req.tenantClient);
      res.json({ success: true, data });
    } catch (error) {
      console.error("NotificationController.list error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load notifications",
      });
    }
  },

  async markAllRead(req: Request, res: Response): Promise<void> {
    if (!req.tenantClient) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    try {
      const result = await NotificationModel.markAllRead(req.tenantClient);
      res.json({ success: true, data: { updatedCount: result.count } });
    } catch (error) {
      console.error("NotificationController.markAllRead error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update notifications",
      });
    }
  },
};