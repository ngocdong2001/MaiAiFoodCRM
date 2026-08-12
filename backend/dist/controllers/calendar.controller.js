"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarController = void 0;
const client_1 = require("../generated/prisma/client");
const calendar_model_1 = require("../models/calendar.model");
const parseId = (value) => { const id = Number.parseInt(value, 10); return Number.isInteger(id) && id > 0 ? id : null; };
const validDate = (value) => !Number.isNaN(new Date(value).getTime());
const validateInput = (input) => {
    if (!Number.isInteger(input.guestId) || !Number.isInteger(input.staffId))
        return "Guest and staff are required";
    if (!validDate(input.startTime) || !validDate(input.endTime))
        return "Valid start and end times are required";
    if (new Date(input.startTime) >= new Date(input.endTime))
        return "End time must be after start time";
    if (!Array.isArray(input.serviceIds) || input.serviceIds.length === 0)
        return "At least one service is required";
    if (input.status && !calendar_model_1.APPOINTMENT_STATUSES.includes(input.status))
        return "Invalid appointment status";
    return null;
};
const handleError = (res, error, fallback) => {
    console.error(fallback, error);
    if (error instanceof calendar_model_1.CalendarDomainError)
        return void res.status(error.statusCode).json({ success: false, message: error.message });
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025")
            return void res.status(404).json({ success: false, message: "Appointment not found" });
        if (error.code === "P2003")
            return void res.status(400).json({ success: false, message: "Invalid appointment relation" });
    }
    res.status(500).json({ success: false, message: fallback });
};
exports.CalendarController = {
    async getAll(req, res) {
        const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
        const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";
        const status = typeof req.query.status === "string" ? req.query.status : undefined;
        if (!validDate(startDate) || !validDate(endDate))
            return void res.status(400).json({ success: false, message: "Valid startDate and endDate are required" });
        if (status && !calendar_model_1.APPOINTMENT_STATUSES.includes(status))
            return void res.status(400).json({ success: false, message: "Invalid appointment status" });
        try {
            const staffIds = typeof req.query.staffIds === "string" ? req.query.staffIds.split(",").map(Number).filter(Number.isInteger) : undefined;
            res.status(200).json({ success: true, data: await calendar_model_1.CalendarModel.getAll({ startDate, endDate, staffIds, status: status }) });
        }
        catch (error) {
            handleError(res, error, "Failed to load appointments");
        }
    },
    async getOptions(_req, res) { try {
        res.status(200).json({ success: true, data: await calendar_model_1.CalendarModel.getOptions() });
    }
    catch (error) {
        handleError(res, error, "Failed to load calendar options");
    } },
    async create(req, res) { const input = req.body; const validation = validateInput(input); if (validation)
        return void res.status(400).json({ success: false, message: validation }); try {
        res.status(201).json({ success: true, data: await calendar_model_1.CalendarModel.create(input), message: "Appointment created successfully" });
    }
    catch (error) {
        handleError(res, error, "Failed to create appointment");
    } },
    async update(req, res) { const id = parseId(req.params.id); const input = req.body; const validation = validateInput(input); if (!id)
        return void res.status(400).json({ success: false, message: "Invalid appointment ID" }); if (validation)
        return void res.status(400).json({ success: false, message: validation }); try {
        res.status(200).json({ success: true, data: await calendar_model_1.CalendarModel.update(id, input), message: "Appointment updated successfully" });
    }
    catch (error) {
        handleError(res, error, "Failed to update appointment");
    } },
    async updateStatus(req, res) { const id = parseId(req.params.id); const status = req.body.status; if (!id)
        return void res.status(400).json({ success: false, message: "Invalid appointment ID" }); if (!calendar_model_1.APPOINTMENT_STATUSES.includes(status))
        return void res.status(400).json({ success: false, message: "Invalid appointment status" }); try {
        res.status(200).json({ success: true, data: await calendar_model_1.CalendarModel.updateStatus(id, status, req.body.cancelReason), message: "Appointment status updated" });
    }
    catch (error) {
        handleError(res, error, "Failed to update appointment status");
    } },
    async delete(req, res) { const id = parseId(req.params.id); if (!id)
        return void res.status(400).json({ success: false, message: "Invalid appointment ID" }); try {
        const data = await calendar_model_1.CalendarModel.delete(id);
        res.status(200).json({ success: true, data, message: data.cancelled ? "Paid appointment cancelled and preserved" : "Appointment deleted successfully" });
    }
    catch (error) {
        handleError(res, error, "Failed to delete appointment");
    } },
};
