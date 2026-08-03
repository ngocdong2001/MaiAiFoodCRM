"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfoController = void 0;
const info_model_1 = require("../models/info.model");
exports.InfoController = {
    async create(req, res) {
        try {
            const { firstName, lastName, email, salonName } = req.body;
            if (!firstName || !lastName || !email || !salonName) {
                res.status(400).json({
                    success: false,
                    message: "All fields are required",
                });
                return;
            }
            const newRecord = await info_model_1.InfoModel.create({
                firstName,
                lastName,
                email,
                salonName,
            });
            res.status(201).json({
                success: true,
                message: "Info saved successfully",
                data: newRecord,
            });
        }
        catch (error) {
            console.error("InfoController.create error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to save info",
            });
        }
    },
    async getAll(_req, res) {
        try {
            const data = await info_model_1.InfoModel.getAll();
            res.status(200).json(data);
        }
        catch (error) {
            console.error("InfoController.getAll error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to retrieve info",
            });
        }
    },
};
