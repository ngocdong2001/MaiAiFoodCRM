import type { PrismaClient } from "../generated/prisma-tenant/client.js";

export type ServiceInput = {
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  categoryId: number;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export type ServiceCategoryInput = {
  name: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type ServiceListFilters = {
  search?: string;
  categoryId?: number;
  isActive?: boolean;
};

export type ServiceBulkInput = {
  upserts: Array<ServiceInput & { id?: number | null }>;
  deleteIds: number[];
};

const nullableText = (value?: string | null) => value?.trim() || null;

const serviceInclude = { servicecategory: true };

const serializeService = (service: any) => ({
  id: service.id,
  name: service.name,
  description: service.description,
  price: Number(service.price),
  durationMinutes: service.durationMinutes,
  categoryId: service.categoryId,
  imageUrl: service.imageUrl,
  isActive: service.isActive,
  sortOrder: service.sortOrder,
  category: service.servicecategory
    ? {
        id: service.servicecategory.id,
        name: service.servicecategory.name,
        description: service.servicecategory.description,
        icon: service.servicecategory.icon,
        sortOrder: service.servicecategory.sortOrder,
        isActive: service.servicecategory.isActive,
      }
    : null,
  bookingCount: service._count?.appointmentservice ?? 0,
  createdAt: service.createdAt,
  updatedAt: service.updatedAt,
});

const serializeCategory = (category: any) => ({
  id: category.id,
  name: category.name,
  description: category.description,
  icon: category.icon,
  sortOrder: category.sortOrder,
  isActive: category.isActive,
  serviceCount: category._count?.service ?? 0,
});

const removeServiceCascade = async (db: PrismaClient, id: number) => {
  await db.airecommendation.deleteMany({ where: { serviceId: id } });
  await db.appointmentservice.deleteMany({ where: { serviceId: id } });
  await db.service.delete({ where: { id } });
};

const buildServiceData = (input: ServiceInput) => ({
  name: input.name.trim(),
  description: nullableText(input.description),
  price: input.price,
  durationMinutes: input.durationMinutes,
  categoryId: input.categoryId,
  imageUrl: nullableText(input.imageUrl),
  isActive: input.isActive ?? true,
  sortOrder: input.sortOrder ?? 0,
  updatedAt: new Date(),
});

export const ServiceModel = {
  async getAll(db: PrismaClient, filters: ServiceListFilters = {}) {
    const services = await db.service.findMany({
      where: {
        ...(filters.search
          ? {
              OR: [
                { name: { contains: filters.search } },
                { description: { contains: filters.search } },
              ],
            }
          : {}),
        ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters.isActive === undefined
          ? {}
          : { isActive: filters.isActive }),
      },
      include: {
        ...serviceInclude,
        _count: { select: { appointmentservice: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return services.map(serializeService);
  },

  async getById(db: PrismaClient, id: number) {
    const service = await db.service.findUnique({
      where: { id },
      include: {
        ...serviceInclude,
        _count: { select: { appointmentservice: true } },
      },
    });
    return service ? serializeService(service) : null;
  },

  async create(db: PrismaClient, input: ServiceInput) {
    const service = await db.service.create({
      data: buildServiceData(input),
      include: serviceInclude,
    });
    return serializeService(service);
  },

  async update(db: PrismaClient, id: number, input: ServiceInput) {
    const service = await db.service.update({
      where: { id },
      data: buildServiceData(input),
      include: serviceInclude,
    });
    return serializeService(service);
  },

  async setActive(db: PrismaClient, id: number, isActive: boolean) {
    const service = await db.service.update({
      where: { id },
      data: { isActive, updatedAt: new Date() },
      include: serviceInclude,
    });
    return serializeService(service);
  },

  // Removes booking lines and AI suggestions first so the service row itself can be deleted.
  async delete(db: PrismaClient, id: number) {
    await db.$transaction(async (tx) => {
      await removeServiceCascade(tx as unknown as PrismaClient, id);
    });
  },

  // Spreadsheet-style save: applies every row edit, insert and removal in one transaction.
  async bulkSave(db: PrismaClient, input: ServiceBulkInput) {
    await db.$transaction(async (tx) => {
      const trx = tx as unknown as PrismaClient;

      for (const id of input.deleteIds) {
        await removeServiceCascade(trx, id);
      }

      for (const row of input.upserts) {
        if (row.id) {
          await trx.service.update({
            where: { id: row.id },
            data: buildServiceData(row),
          });
        } else {
          await trx.service.create({ data: buildServiceData(row) });
        }
      }
    });

    return ServiceModel.getAll(db);
  },

  async getCategories(db: PrismaClient) {
    const categories = await db.servicecategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { _count: { select: { service: true } } },
    });
    return categories.map(serializeCategory);
  },

  async createCategory(db: PrismaClient, input: ServiceCategoryInput) {
    const category = await db.servicecategory.create({
      data: {
        name: input.name.trim(),
        description: nullableText(input.description),
        icon: nullableText(input.icon),
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      },
      include: { _count: { select: { service: true } } },
    });
    return serializeCategory(category);
  },

  async updateCategory(
    db: PrismaClient,
    id: number,
    input: ServiceCategoryInput,
  ) {
    const category = await db.servicecategory.update({
      where: { id },
      data: {
        name: input.name.trim(),
        description: nullableText(input.description),
        icon: nullableText(input.icon),
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        updatedAt: new Date(),
      },
      include: { _count: { select: { service: true } } },
    });
    return serializeCategory(category);
  },

  async deleteCategory(db: PrismaClient, id: number) {
    const serviceCount = await db.service.count({ where: { categoryId: id } });
    if (serviceCount > 0) return { deleted: false, serviceCount };
    await db.servicecategory.delete({ where: { id } });
    return { deleted: true, serviceCount: 0 };
  },
};
