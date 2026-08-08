"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueController = void 0;
const revenue_model_1 = require("../models/revenue.model");
exports.RevenueController = {
    async getSummary(req, res) {
        try {
            const staffIdRaw = req.query.staffId;
            const staffIdValue = typeof staffIdRaw === "string" && staffIdRaw.trim() !== ""
                ? Number.parseInt(staffIdRaw, 10)
                : undefined;
            const data = await revenue_model_1.RevenueModel.getSummary({
                startDate: typeof req.query.startDate === "string"
                    ? req.query.startDate
                    : undefined,
                endDate: typeof req.query.endDate === "string" ? req.query.endDate : undefined,
                staffId: Number.isFinite(staffIdValue) ? staffIdValue : undefined,
                paymentMethod: typeof req.query.paymentMethod === "string"
                    ? req.query.paymentMethod
                    : undefined,
            });
            res.status(200).json(data);
        }
        catch (error) {
            console.error("RevenueController.getSummary error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to load revenue summary",
            });
        }
    },
};
