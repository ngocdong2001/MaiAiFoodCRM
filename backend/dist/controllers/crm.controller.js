"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRMController = void 0;
const client_1 = require("../generated/prisma/client");
const crm_model_1 = require("../models/crm.model");
const SEGMENTS = ["VIP", "Loyal", "At Risk"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const parseId = (value) => {
    const id = Number.parseInt(value, 10);
    return Number.isInteger(id) && id > 0 ? id : null;
};
const validateGuest = (input) => {
    if (!input.name?.trim())
        return "Guest name is required";
    if (input.dateOfBirth && !DATE_PATTERN.test(input.dateOfBirth))
        return "Date of birth must use YYYY-MM-DD format";
    if (input.loyaltyPoints !== undefined && input.loyaltyPoints < 0)
        return "Loyalty points cannot be negative";
    return null;
};
const handleError = (res, error, fallback) => {
    console.error(fallback, error);
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025")
            return void res.status(404).json({ success: false, message: "Guest not found" });
        if (error.code === "P2002")
            return void res.status(409).json({ success: false, message: "Phone or email already belongs to another guest" });
        if (error.code === "P2003")
            return void res.status(400).json({ success: false, message: "Invalid guest tag" });
    }
    res.status(500).json({ success: false, message: fallback });
};
exports.CRMController = {
    async getAll(req, res) {
        const segment = typeof req.query.segment === "string" ? req.query.segment : undefined;
        if (segment && !SEGMENTS.includes(segment)) {
            res.status(400).json({ success: false, message: "Invalid guest segment" });
            return;
        }
        try {
            const data = await crm_model_1.CRMModel.getAll({
                search: typeof req.query.search === "string" ? req.query.search.trim() : undefined,
                segment: segment,
            });
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            handleError(res, error, "Failed to load guests");
        }
    },
    async getTags(_req, res) {
        try {
            res.status(200).json({ success: true, data: await crm_model_1.CRMModel.getTags() });
        }
        catch (error) {
            handleError(res, error, "Failed to load guest tags");
        }
    },
    async getById(req, res) {
        const id = parseId(req.params.id);
        if (!id)
            return void res.status(400).json({ success: false, message: "Invalid guest ID" });
        try {
            const data = await crm_model_1.CRMModel.getById(id);
            if (!data)
                return void res.status(404).json({ success: false, message: "Guest not found" });
            res.status(200).json({ success: true, data });
        }
        catch (error) {
            handleError(res, error, "Failed to load guest");
        }
    },
    async create(req, res) {
        const input = req.body;
        const validationError = validateGuest(input);
        if (validationError)
            return void res.status(400).json({ success: false, message: validationError });
        try {
            res.status(201).json({ success: true, data: await crm_model_1.CRMModel.create(input), message: "Guest created successfully" });
        }
        catch (error) {
            handleError(res, error, "Failed to create guest");
        }
    },
    async update(req, res) {
        const id = parseId(req.params.id);
        if (!id)
            return void res.status(400).json({ success: false, message: "Invalid guest ID" });
        const input = req.body;
        const validationError = validateGuest(input);
        if (validationError)
            return void res.status(400).json({ success: false, message: validationError });
        try {
            res.status(200).json({ success: true, data: await crm_model_1.CRMModel.update(id, input), message: "Guest updated successfully" });
        }
        catch (error) {
            handleError(res, error, "Failed to update guest");
        }
    },
    async updateNotes(req, res) {
        const id = parseId(req.params.id);
        const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
        if (!id)
            return void res.status(400).json({ success: false, message: "Invalid guest ID" });
        if (!content)
            return void res.status(400).json({ success: false, message: "Note content is required" });
        try {
            res.status(200).json({ success: true, data: await crm_model_1.CRMModel.updateNotes(id, content, req.body.author), message: "Notes updated successfully" });
        }
        catch (error) {
            handleError(res, error, "Failed to update guest notes");
        }
    },
    async delete(req, res) {
        const id = parseId(req.params.id);
        if (!id)
            return void res.status(400).json({ success: false, message: "Invalid guest ID" });
        try {
            const data = await crm_model_1.CRMModel.delete(id);
            res.status(200).json({ success: true, data, message: data.archived ? "Guest archived to preserve booking history" : "Guest deleted successfully" });
        }
        catch (error) {
            handleError(res, error, "Failed to delete guest");
        }
    },
};
