import type { Request, Response } from "express";

import { Prisma } from "../generated/prisma-tenant/client.js";
import { CRMModel, type GuestInput, type GuestSegment } from "../models/crm.model";

const getDb = (req: Request) => req.tenantClient!;

const SEGMENTS: GuestSegment[] = ["VIP", "Loyal", "At Risk"];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseId = (value: string) => {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const validateGuest = (input: GuestInput) => {
  if (!input.name?.trim()) return "Guest name is required";
  if (input.dateOfBirth && !DATE_PATTERN.test(input.dateOfBirth)) return "Date of birth must use YYYY-MM-DD format";
  if (input.loyaltyPoints !== undefined && input.loyaltyPoints < 0) return "Loyalty points cannot be negative";
  return null;
};

const handleError = (res: Response, error: unknown, fallback: string) => {
  console.error(fallback, error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") return void res.status(404).json({ success: false, message: "Guest not found" });
    if (error.code === "P2002") return void res.status(409).json({ success: false, message: "Phone or email already belongs to another guest" });
    if (error.code === "P2003") return void res.status(400).json({ success: false, message: "Invalid guest tag" });
  }
  res.status(500).json({ success: false, message: fallback });
};

export const CRMController = {
  async getAll(req: Request, res: Response): Promise<void> {
    const segment = typeof req.query.segment === "string" ? req.query.segment : undefined;
    if (segment && !SEGMENTS.includes(segment as GuestSegment)) {
      res.status(400).json({ success: false, message: "Invalid guest segment" });
      return;
    }
    try {
      const data = await CRMModel.getAll(getDb(req), {
        search: typeof req.query.search === "string" ? req.query.search.trim() : undefined,
        segment: segment as GuestSegment | undefined,
      });
      res.status(200).json({ success: true, data });
    } catch (error) { handleError(res, error, "Failed to load guests"); }
  },

  async getTags(req: Request, res: Response): Promise<void> {
    try { res.status(200).json({ success: true, data: await CRMModel.getTags(getDb(req)) }); }
    catch (error) { handleError(res, error, "Failed to load guest tags"); }
  },

  async getById(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    if (!id) return void res.status(400).json({ success: false, message: "Invalid guest ID" });
    try {
      const data = await CRMModel.getById(getDb(req), id);
      if (!data) return void res.status(404).json({ success: false, message: "Guest not found" });
      res.status(200).json({ success: true, data });
    } catch (error) { handleError(res, error, "Failed to load guest"); }
  },

  async create(req: Request, res: Response): Promise<void> {
    const input = req.body as GuestInput;
    const validationError = validateGuest(input);
    if (validationError) return void res.status(400).json({ success: false, message: validationError });
    try { res.status(201).json({ success: true, data: await CRMModel.create(getDb(req), input), message: "Guest created successfully" }); }
    catch (error) { handleError(res, error, "Failed to create guest"); }
  },

  async update(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    if (!id) return void res.status(400).json({ success: false, message: "Invalid guest ID" });
    const input = req.body as GuestInput;
    const validationError = validateGuest(input);
    if (validationError) return void res.status(400).json({ success: false, message: validationError });
    try { res.status(200).json({ success: true, data: await CRMModel.update(getDb(req), id, input), message: "Guest updated successfully" }); }
    catch (error) { handleError(res, error, "Failed to update guest"); }
  },

  async updateNotes(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    const content = typeof req.body.content === "string" ? req.body.content.trim() : "";
    if (!id) return void res.status(400).json({ success: false, message: "Invalid guest ID" });
    if (!content) return void res.status(400).json({ success: false, message: "Note content is required" });
    try { res.status(200).json({ success: true, data: await CRMModel.updateNotes(getDb(req), id, content, req.body.author), message: "Notes updated successfully" }); }
    catch (error) { handleError(res, error, "Failed to update guest notes"); }
  },

  async delete(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    if (!id) return void res.status(400).json({ success: false, message: "Invalid guest ID" });
    try {
      const data = await CRMModel.delete(getDb(req), id);
      res.status(200).json({ success: true, data, message: data.archived ? "Guest archived to preserve booking history" : "Guest deleted successfully" });
    } catch (error) { handleError(res, error, "Failed to delete guest"); }
  },
};