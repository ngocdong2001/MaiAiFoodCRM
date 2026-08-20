import type { Request, Response } from "express";

import { Prisma } from "../generated/prisma-tenant/client.js";
import {
  ServiceModel,
  type ServiceCategoryInput,
  type ServiceInput,
} from "../models/service.model";

const getDb = (req: Request) => req.tenantClient!;

const parseId = (value: string) => {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const asString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const asOptionalNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const validateService = (body: ServiceInput): string | null => {
  if (!asString(body?.name)) return "Service name is required";
  if (asString(body?.name).length > 255)
    return "Service name must be 255 characters or fewer";
  if (!Number.isFinite(Number(body?.price)) || Number(body.price) < 0) {
    return "Price must be a non-negative number";
  }
  if (
    !Number.isInteger(Number(body?.durationMinutes)) ||
    Number(body.durationMinutes) <= 0
  ) {
    return "Duration must be a positive whole number of minutes";
  }
  if (
    !Number.isInteger(Number(body?.categoryId)) ||
    Number(body.categoryId) <= 0
  ) {
    return "A valid category is required";
  }
  return null;
};

const normalizeService = (body: ServiceInput): ServiceInput => ({
  name: asString(body.name),
  description: typeof body.description === "string" ? body.description : null,
  price: Number(body.price),
  durationMinutes: Number(body.durationMinutes),
  categoryId: Number(body.categoryId),
  imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : null,
  isActive: typeof body.isActive === "boolean" ? body.isActive : true,
  sortOrder: asOptionalNumber(body.sortOrder) ?? 0,
});

const normalizeCategory = (
  body: ServiceCategoryInput,
): ServiceCategoryInput => ({
  name: asString(body?.name),
  description: typeof body?.description === "string" ? body.description : null,
  icon: typeof body?.icon === "string" ? body.icon : null,
  sortOrder: asOptionalNumber(body?.sortOrder) ?? 0,
  isActive: typeof body?.isActive === "boolean" ? body.isActive : true,
});

const handleError = (res: Response, error: unknown, message: string) => {
  console.error(message, error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return void res
        .status(404)
        .json({ success: false, message: "Record not found" });
    }
    if (error.code === "P2002") {
      return void res.status(409).json({
        success: false,
        message: "A record with this name already exists",
      });
    }
    if (error.code === "P2003") {
      return void res.status(409).json({
        success: false,
        message: "The selected category does not exist",
      });
    }
  }
  return void res.status(500).json({ success: false, message });
};

export const ServiceController = {
  async getAll(req: Request, res: Response) {
    try {
      const search = asString(req.query.search) || undefined;
      const categoryId = asOptionalNumber(req.query.categoryId);
      const activeParam = asString(req.query.isActive);
      const data = await ServiceModel.getAll(getDb(req), {
        search,
        categoryId: Number.isInteger(categoryId) ? categoryId : undefined,
        isActive: activeParam === "" ? undefined : activeParam === "true",
      });
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, error, "Failed to load services");
    }
  },

  async getById(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id)
      return void res
        .status(400)
        .json({ success: false, message: "Invalid service ID" });
    try {
      const data = await ServiceModel.getById(getDb(req), id);
      if (!data)
        return void res
          .status(404)
          .json({ success: false, message: "Service not found" });
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, error, "Failed to load service");
    }
  },

  async create(req: Request, res: Response) {
    const body = req.body as ServiceInput;
    const errorMessage = validateService(body);
    if (errorMessage)
      return void res
        .status(400)
        .json({ success: false, message: errorMessage });
    try {
      const data = await ServiceModel.create(
        getDb(req),
        normalizeService(body),
      );
      res
        .status(201)
        .json({ success: true, data, message: "Service created successfully" });
    } catch (error) {
      handleError(res, error, "Failed to create service");
    }
  },

  async update(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id)
      return void res
        .status(400)
        .json({ success: false, message: "Invalid service ID" });
    const body = req.body as ServiceInput;
    const errorMessage = validateService(body);
    if (errorMessage)
      return void res
        .status(400)
        .json({ success: false, message: errorMessage });
    try {
      const data = await ServiceModel.update(
        getDb(req),
        id,
        normalizeService(body),
      );
      res.json({
        success: true,
        data,
        message: "Service updated successfully",
      });
    } catch (error) {
      handleError(res, error, "Failed to update service");
    }
  },

  async toggleActive(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id)
      return void res
        .status(400)
        .json({ success: false, message: "Invalid service ID" });
    if (typeof req.body?.isActive !== "boolean") {
      return void res
        .status(400)
        .json({ success: false, message: "isActive must be a boolean" });
    }
    try {
      const data = await ServiceModel.setActive(
        getDb(req),
        id,
        req.body.isActive,
      );
      res.json({
        success: true,
        data,
        message: data.isActive ? "Service published" : "Service hidden",
      });
    } catch (error) {
      handleError(res, error, "Failed to update service availability");
    }
  },

  async bulkSave(req: Request, res: Response) {
    const body = req.body as {
      upserts?: Array<ServiceInput & { id?: unknown }>;
      deleteIds?: unknown[];
    };
    const rows = Array.isArray(body?.upserts) ? body.upserts : [];
    const deleteIds = (Array.isArray(body?.deleteIds) ? body.deleteIds : [])
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);

    for (const [index, row] of rows.entries()) {
      const errorMessage = validateService(row);
      if (errorMessage) {
        return void res
          .status(400)
          .json({
            success: false,
            message: `Row ${index + 1}: ${errorMessage}`,
          });
      }
    }

    try {
      const data = await ServiceModel.bulkSave(getDb(req), {
        upserts: rows.map((row) => ({
          ...normalizeService(row),
          id: asOptionalNumber(row.id) ?? null,
        })),
        deleteIds,
      });
      res.json({ success: true, data, message: "Changes saved successfully" });
    } catch (error) {
      handleError(res, error, "Failed to save service changes");
    }
  },

  async delete(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id)
      return void res
        .status(400)
        .json({ success: false, message: "Invalid service ID" });
    try {
      await ServiceModel.delete(getDb(req), id);
      res.json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
      handleError(res, error, "Failed to delete service");
    }
  },

  async getCategories(req: Request, res: Response) {
    try {
      const data = await ServiceModel.getCategories(getDb(req));
      res.json({ success: true, data });
    } catch (error) {
      handleError(res, error, "Failed to load service categories");
    }
  },

  async createCategory(req: Request, res: Response) {
    const input = normalizeCategory(req.body as ServiceCategoryInput);
    if (!input.name)
      return void res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    try {
      const data = await ServiceModel.createCategory(getDb(req), input);
      res.status(201).json({
        success: true,
        data,
        message: "Category created successfully",
      });
    } catch (error) {
      handleError(res, error, "Failed to create service category");
    }
  },

  async updateCategory(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id)
      return void res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    const input = normalizeCategory(req.body as ServiceCategoryInput);
    if (!input.name)
      return void res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    try {
      const data = await ServiceModel.updateCategory(getDb(req), id, input);
      res.json({
        success: true,
        data,
        message: "Category updated successfully",
      });
    } catch (error) {
      handleError(res, error, "Failed to update service category");
    }
  },

  async deleteCategory(req: Request, res: Response) {
    const id = parseId(req.params.id);
    if (!id)
      return void res
        .status(400)
        .json({ success: false, message: "Invalid category ID" });
    try {
      const result = await ServiceModel.deleteCategory(getDb(req), id);
      if (!result.deleted) {
        return void res.status(409).json({
          success: false,
          message: `Move or delete the ${result.serviceCount} service(s) in this category first`,
        });
      }
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
      handleError(res, error, "Failed to delete service category");
    }
  },
};
