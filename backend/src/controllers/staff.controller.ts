import type { Request, Response } from "express";

import { Prisma } from "../generated/prisma-tenant/client.js";
import {
  STAFF_STATUSES,
  StaffModel,
  type StaffInput,
  type StaffStatus,
} from "../models/staff.model";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const parseId = (value: string) => {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const validateInput = (body: StaffInput): string | null => {
  if (!body.name?.trim() || !body.role?.trim()) {
    return "Name and role are required";
  }

  if (body.status && !STAFF_STATUSES.includes(body.status)) {
    return "Invalid staff status";
  }

  if (
    body.hourlyRate !== null &&
    body.hourlyRate !== undefined &&
    body.hourlyRate < 0
  ) {
    return "Hourly rate cannot be negative";
  }

  if (
    body.commissionRate !== null &&
    body.commissionRate !== undefined &&
    (body.commissionRate < 0 || body.commissionRate > 100)
  ) {
    return "Commission rate must be between 0 and 100";
  }

  if (body.joinDate && !ISO_DATE_PATTERN.test(body.joinDate)) {
    return "Join date must use YYYY-MM-DD format";
  }

  if (body.schedule) {
    const { date, startTime, endTime, breakStart, breakEnd } = body.schedule;
    if (!ISO_DATE_PATTERN.test(date)) {
      return "Schedule date must use YYYY-MM-DD format";
    }
    if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
      return "Schedule times must use HH:MM format";
    }
    if (startTime >= endTime) {
      return "Schedule end time must be after start time";
    }
    if ((breakStart && !breakEnd) || (!breakStart && breakEnd)) {
      return "Break start and break end must be provided together";
    }
    if (breakStart && !TIME_PATTERN.test(breakStart)) {
      return "Break start must use HH:MM format";
    }
    if (breakEnd && !TIME_PATTERN.test(breakEnd)) {
      return "Break end must use HH:MM format";
    }
    if (breakStart && breakEnd && breakStart >= breakEnd) {
      return "Break end time must be after break start time";
    }
    if (breakStart && breakEnd && breakStart < startTime) {
      return "Break start time must be within the staff working shift";
    }
    if (breakStart && breakEnd && breakEnd > endTime) {
      return "Break end time must be within the staff working shift";
    }
  }

  return null;
};

const handleError = (res: Response, error: unknown, message: string) => {
  console.error(message, error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      res.status(404).json({ success: false, message: "Staff not found" });
      return;
    }
    if (error.code === "P2002") {
      res
        .status(409)
        .json({ success: false, message: "Staff data already exists" });
      return;
    }
    if (error.code === "P2003") {
      res.status(409).json({
        success: false,
        message: "This record is still referenced by other data",
      });
      return;
    }
  }
  res.status(500).json({ success: false, message });
};

export const StaffController = {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const status =
        typeof req.query.status === "string" ? req.query.status : undefined;
      if (status && !STAFF_STATUSES.includes(status as StaffStatus)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid staff status" });
        return;
      }

      const date =
        typeof req.query.date === "string"
          ? req.query.date
          : new Date().toISOString().slice(0, 10);
      if (!ISO_DATE_PATTERN.test(date)) {
        res
          .status(400)
          .json({ success: false, message: "Date must use YYYY-MM-DD format" });
        return;
      }

      const data = await StaffModel.getAll({
        date,
        status: status as StaffStatus | undefined,
        search:
          typeof req.query.search === "string"
            ? req.query.search.trim()
            : undefined,
      });
      res.status(200).json({ success: true, data });
    } catch (error) {
      handleError(res, error, "Failed to load staff");
    }
  },

  async getSpecialties(_req: Request, res: Response): Promise<void> {
    try {
      const data = await StaffModel.getSpecialties();
      res.status(200).json({ success: true, data });
    } catch (error) {
      handleError(res, error, "Failed to load staff specialties");
    }
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid staff ID" });
      return;
    }
    try {
      const data = await StaffModel.getById(id);
      if (!data) {
        res.status(404).json({ success: false, message: "Staff not found" });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      handleError(res, error, "Failed to load staff member");
    }
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.body as StaffInput;
    const validationError = validateInput(input);
    if (validationError) {
      res.status(400).json({ success: false, message: validationError });
      return;
    }
    try {
      const data = await StaffModel.create(input);
      res
        .status(201)
        .json({ success: true, data, message: "Staff created successfully" });
    } catch (error) {
      handleError(res, error, "Failed to create staff");
    }
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid staff ID" });
      return;
    }
    const input = req.body as StaffInput;
    const validationError = validateInput(input);
    if (validationError) {
      res.status(400).json({ success: false, message: validationError });
      return;
    }
    try {
      const data = await StaffModel.update(id, input);
      res
        .status(200)
        .json({ success: true, data, message: "Staff updated successfully" });
    } catch (error) {
      handleError(res, error, "Failed to update staff");
    }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    if (!id) {
      res.status(400).json({ success: false, message: "Invalid staff ID" });
      return;
    }
    try {
      const result = await StaffModel.delete(id);
      res.status(200).json({
        success: true,
        message: result.archived
          ? "Staff archived to preserve appointment history"
          : "Staff deleted successfully",
        data: result,
      });
    } catch (error) {
      handleError(res, error, "Failed to delete staff");
    }
  },
};
