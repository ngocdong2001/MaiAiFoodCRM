import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { APPOINTMENT_STATUSES, CalendarDomainError, CalendarModel, type AppointmentInput, type AppointmentStatus } from "../models/calendar.model";

const parseId = (value: string) => { const id = Number.parseInt(value, 10); return Number.isInteger(id) && id > 0 ? id : null; };
const validDate = (value: string) => !Number.isNaN(new Date(value).getTime());
const validateInput = (input: AppointmentInput) => {
  if (!Number.isInteger(input.guestId) || !Number.isInteger(input.staffId)) return "Guest and staff are required";
  if (!validDate(input.startTime) || !validDate(input.endTime)) return "Valid start and end times are required";
  if (new Date(input.startTime) >= new Date(input.endTime)) return "End time must be after start time";
  if (!Array.isArray(input.serviceIds) || input.serviceIds.length === 0) return "At least one service is required";
  if (input.status && !APPOINTMENT_STATUSES.includes(input.status)) return "Invalid appointment status";
  return null;
};
const handleError = (res: Response, error: unknown, fallback: string) => {
  console.error(fallback, error);
  if (error instanceof CalendarDomainError) return void res.status(error.statusCode).json({ success: false, message: error.message });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return void res.status(404).json({ success: false, message: "Appointment not found" });
    if (error.code === "P2003") return void res.status(400).json({ success: false, message: "Invalid appointment relation" });
  }
  res.status(500).json({ success: false, message: fallback });
};

export const CalendarController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const startDate = typeof req.query.startDate === "string" ? req.query.startDate : "";
    const endDate = typeof req.query.endDate === "string" ? req.query.endDate : "";
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    if (!validDate(startDate) || !validDate(endDate)) return void res.status(400).json({ success: false, message: "Valid startDate and endDate are required" });
    if (status && !APPOINTMENT_STATUSES.includes(status as AppointmentStatus)) return void res.status(400).json({ success: false, message: "Invalid appointment status" });
    try { const staffIds = typeof req.query.staffIds === "string" ? req.query.staffIds.split(",").map(Number).filter(Number.isInteger) : undefined; res.status(200).json({ success: true, data: await CalendarModel.getAll({ startDate, endDate, staffIds, status: status as AppointmentStatus | undefined }) }); }
    catch (error) { handleError(res, error, "Failed to load appointments"); }
  },
  async getOptions(_req: Request, res: Response): Promise<void> { try { res.status(200).json({ success: true, data: await CalendarModel.getOptions() }); } catch (error) { handleError(res, error, "Failed to load calendar options"); } },
  async create(req: Request, res: Response): Promise<void> { const input = req.body as AppointmentInput; const validation = validateInput(input); if (validation) return void res.status(400).json({ success: false, message: validation }); try { res.status(201).json({ success: true, data: await CalendarModel.create(input), message: "Appointment created successfully" }); } catch (error) { handleError(res, error, "Failed to create appointment"); } },
  async update(req: Request, res: Response): Promise<void> { const id = parseId(req.params.id); const input = req.body as AppointmentInput; const validation = validateInput(input); if (!id) return void res.status(400).json({ success: false, message: "Invalid appointment ID" }); if (validation) return void res.status(400).json({ success: false, message: validation }); try { res.status(200).json({ success: true, data: await CalendarModel.update(id, input), message: "Appointment updated successfully" }); } catch (error) { handleError(res, error, "Failed to update appointment"); } },
  async updateStatus(req: Request, res: Response): Promise<void> { const id = parseId(req.params.id); const status = req.body.status as AppointmentStatus; if (!id) return void res.status(400).json({ success: false, message: "Invalid appointment ID" }); if (!APPOINTMENT_STATUSES.includes(status)) return void res.status(400).json({ success: false, message: "Invalid appointment status" }); try { res.status(200).json({ success: true, data: await CalendarModel.updateStatus(id, status, req.body.cancelReason), message: "Appointment status updated" }); } catch (error) { handleError(res, error, "Failed to update appointment status"); } },
  async delete(req: Request, res: Response): Promise<void> { const id = parseId(req.params.id); if (!id) return void res.status(400).json({ success: false, message: "Invalid appointment ID" }); try { const data = await CalendarModel.delete(id); res.status(200).json({ success: true, data, message: data.cancelled ? "Paid appointment cancelled and preserved" : "Appointment deleted successfully" }); } catch (error) { handleError(res, error, "Failed to delete appointment"); } },
};