import type { Request, Response } from "express";

import { queueEvents } from "../lib/queue-events.js";
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
          typeof req.query.endDate === "string" ? req.query.endDate : undefined,
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

  async updateCancelReason(req: Request, res: Response): Promise<void> {
    try {
      const recordId = Number.parseInt(req.params.recordId, 10);
      if (!Number.isFinite(recordId)) {
        res.status(400).json({ success: false, message: "Invalid recordId" });
        return;
      }
      const { cancelReason } = req.body;
      if (
        !cancelReason ||
        typeof cancelReason !== "string" ||
        !cancelReason.trim()
      ) {
        res
          .status(400)
          .json({ success: false, message: "cancelReason is required" });
        return;
      }

      const data = await RevenueModel.updateCancelReason(
        getDb(req),
        recordId,
        cancelReason.trim(),
      );
      if (!data) {
        res
          .status(404)
          .json({
            success: false,
            message: "Revenue record not found or not cancelled",
          });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("RevenueController.updateCancelReason error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update cancel reason",
      });
    }
  },

  async restoreBooking(req: Request, res: Response): Promise<void> {
    try {
      const recordId = Number.parseInt(req.params.recordId, 10);
      if (!Number.isFinite(recordId)) {
        res.status(400).json({ success: false, message: "Invalid recordId" });
        return;
      }

      const data = await RevenueModel.restoreBooking(getDb(req), recordId);
      if (!data) {
        res
          .status(404)
          .json({
            success: false,
            message: "Revenue record not found or not cancelled",
          });
        return;
      }
      res.status(200).json({ success: true, data });
      if (req.tenant)
        queueEvents.publish(
          req.tenant.id,
          "appointment.status_changed",
          data.appointmentId,
        );
    } catch (error) {
      console.error("RevenueController.restoreBooking error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to restore booking",
      });
    }
  },
};
