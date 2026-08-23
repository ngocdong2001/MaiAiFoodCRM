import { Prisma } from "../generated/prisma-tenant/client.js";
import type { PrismaClient } from "../generated/prisma-tenant/client.js";
import { validateWeeklySchedule, getDefaultWeeklySchedule, type WeeklySchedule } from "./schedule.helpers.js";

export const STAFF_STATUSES = ["active", "busy", "on_leave", "inactive"] as const;

export type StaffStatus = (typeof STAFF_STATUSES)[number];

export type StaffScheduleInput = {
  date: string;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
  isDayOff?: boolean;
  note?: string | null;
};

export type StaffInput = {
  name: string;
  role: string;
  status?: StaffStatus;
  phone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  hourlyRate?: number | null;
  commissionRate?: number | null;
  joinDate?: string | null;
  specialtyIds?: number[];
  weeklySchedule?: WeeklySchedule | null; // New: weekly template
  schedule?: StaffScheduleInput | null; // Legacy: per-day override
};

export type StaffListFilters = {
  search?: string;
  status?: StaffStatus;
  date: string;
};

const staffInclude = {
  staffspecialtymapping: {
    include: { staffspecialty: true },
  },
  staffschedule: {
    orderBy: { date: "asc" as const },
  },
};

const parseDate = (value: string): Date => new Date(`${value}T00:00:00.000Z`);

const nullableText = (value?: string | null) => {
  const normalized = value?.trim();
  return normalized ? normalized : null;
};

const serializeStaff = (staff: any) => ({
  id: staff.id,
  name: staff.name,
  role: staff.role,
  status: staff.status,
  phone: staff.phone,
  email: staff.email,
  avatarUrl: staff.avatarUrl,
  hourlyRate: staff.hourlyRate === null ? null : Number(staff.hourlyRate),
  commissionRate:
    staff.commissionRate === null ? null : Number(staff.commissionRate),
  joinDate: staff.joinDate?.toISOString().slice(0, 10) ?? null,
  weeklySchedule: staff.weeklySchedule ?? null,
  specialties: staff.staffspecialtymapping.map(
    (mapping: any) => mapping.staffspecialty,
  ),
  schedules: staff.staffschedule.map((schedule: any) => ({
    ...schedule,
    date: schedule.date.toISOString().slice(0, 10),
  })),
  createdAt: staff.createdAt,
  updatedAt: staff.updatedAt,
});

const buildStaffData = (input: StaffInput) => {
  const data: any = {
    name: input.name.trim(),
    role: input.role.trim(),
    status: input.status ?? "active",
    phone: nullableText(input.phone),
    email: nullableText(input.email)?.toLowerCase() ?? null,
    avatarUrl: nullableText(input.avatarUrl),
    hourlyRate: input.hourlyRate ?? null,
    commissionRate: input.commissionRate ?? null,
    joinDate: input.joinDate ? parseDate(input.joinDate) : null,
    updatedAt: new Date(),
  };

  // Only include weeklySchedule if it's provided (Prisma JSON field handling)
  if (input.weeklySchedule !== undefined) {
    data.weeklySchedule = input.weeklySchedule;
  }

  return data;
};

export const StaffModel = {
  async getAll(db: PrismaClient, filters: StaffListFilters) {
    const date = parseDate(filters.date);
    const where: Prisma.staffWhereInput = {
      status: filters.status ?? { not: "inactive" },
      ...(filters.search
        ? {
          OR: [
            { name: { contains: filters.search } },
            { role: { contains: filters.search } },
            {
              staffschedule: {
                some: { date, note: { contains: filters.search } },
              },
            },
          ],
        }
        : {}),
    };

    const staff = await db.staff.findMany({
      where,
      include: {
        ...staffInclude,
        staffschedule: { where: { date }, orderBy: { date: "asc" } },
      },
      orderBy: { name: "asc" },
    });

    return staff.map(serializeStaff);
  },

  async getById(db: PrismaClient, id: number) {
    const staff = await db.staff.findUnique({
      where: { id },
      include: staffInclude,
    });

    return staff ? serializeStaff(staff) : null;
  },

  async getSpecialties(db: PrismaClient) {
    return db.staffspecialty.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  },

  async create(db: PrismaClient, input: StaffInput) {
    const createdId = await db.$transaction(async (transaction) => {
      const staff = await transaction.staff.create({
        data: {
          ...buildStaffData(input),
          ...(input.specialtyIds?.length
            ? {
              staffspecialtymapping: {
                create: input.specialtyIds.map((specialtyId) => ({
                  specialtyId,
                })),
              },
            }
            : {}),
          ...(input.schedule
            ? {
              staffschedule: {
                create: {
                  ...input.schedule,
                  date: parseDate(input.schedule.date),
                  note: nullableText(input.schedule.note),
                  breakStart: nullableText(input.schedule.breakStart),
                  breakEnd: nullableText(input.schedule.breakEnd),
                  updatedAt: new Date(),
                },
              },
            }
            : {}),
        },
      });

      return staff.id;
    });

    return this.getById(db, createdId);
  },

  async update(db: PrismaClient, id: number, input: StaffInput) {
    await db.$transaction(async (transaction) => {
      await transaction.staff.update({
        where: { id },
        data: {
          ...buildStaffData(input),
          staffspecialtymapping: {
            deleteMany: {},
            create: (input.specialtyIds ?? []).map((specialtyId) => ({
              specialtyId,
            })),
          },
        },
      });

      if (input.schedule) {
        const date = parseDate(input.schedule.date);
        await transaction.staffschedule.upsert({
          where: { staffId_date: { staffId: id, date } },
          create: {
            ...input.schedule,
            staffId: id,
            date,
            note: nullableText(input.schedule.note),
            breakStart: nullableText(input.schedule.breakStart),
            breakEnd: nullableText(input.schedule.breakEnd),
            updatedAt: new Date(),
          },
          update: {
            ...input.schedule,
            date,
            note: nullableText(input.schedule.note),
            breakStart: nullableText(input.schedule.breakStart),
            breakEnd: nullableText(input.schedule.breakEnd),
            updatedAt: new Date(),
          },
        });
      }
    });

    return this.getById(db, id);
  },

  async delete(db: PrismaClient, id: number) {
    const staff = await db.staff.findUnique({
      where: { id },
      select: {
        _count: {
          select: { appointment: true },
        },
      },
    });

    if (!staff) {
      throw new Prisma.PrismaClientKnownRequestError("Staff not found", {
        code: "P2025",
        clientVersion: "6.1.0",
      });
    }

    if (staff._count.appointment > 0) {
      await db.$transaction([
        db.staff.update({
          where: { id },
          data: { status: "inactive", updatedAt: new Date() },
        }),
        db.staffschedule.deleteMany({ where: { staffId: id } }),
        db.staffspecialtymapping.deleteMany({ where: { staffId: id } }),
      ]);
      return { archived: true };
    }

    await db.staff.delete({ where: { id } });
    return { archived: false };
  },
};
