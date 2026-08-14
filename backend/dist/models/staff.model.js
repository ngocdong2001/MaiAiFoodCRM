"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffModel = exports.STAFF_STATUSES = void 0;
const client_1 = require("../generated/prisma/client");
const prisma_1 = require("../lib/prisma");
exports.STAFF_STATUSES = ["active", "busy", "on_leave", "inactive"];
const staffInclude = {
    staffspecialtymapping: {
        include: { staffspecialty: true },
    },
    staffschedule: {
        orderBy: { date: "asc" },
    },
};
const parseDate = (value) => new Date(`${value}T00:00:00.000Z`);
const nullableText = (value) => {
    const normalized = value?.trim();
    return normalized ? normalized : null;
};
const serializeStaff = (staff) => ({
    id: staff.id,
    name: staff.name,
    role: staff.role,
    status: staff.status,
    phone: staff.phone,
    email: staff.email,
    avatarUrl: staff.avatarUrl,
    hourlyRate: staff.hourlyRate === null ? null : Number(staff.hourlyRate),
    commissionRate: staff.commissionRate === null ? null : Number(staff.commissionRate),
    joinDate: staff.joinDate?.toISOString().slice(0, 10) ?? null,
    specialties: staff.staffspecialtymapping.map((mapping) => mapping.staffspecialty),
    schedules: staff.staffschedule.map((schedule) => ({
        ...schedule,
        date: schedule.date.toISOString().slice(0, 10),
    })),
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
});
const buildStaffData = (input) => ({
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
});
exports.StaffModel = {
    async getAll(filters) {
        const date = parseDate(filters.date);
        const where = {
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
        const staff = await prisma_1.prisma.staff.findMany({
            where,
            include: {
                ...staffInclude,
                staffschedule: { where: { date }, orderBy: { date: "asc" } },
            },
            orderBy: { name: "asc" },
        });
        return staff.map(serializeStaff);
    },
    async getById(id) {
        const staff = await prisma_1.prisma.staff.findUnique({
            where: { id },
            include: staffInclude,
        });
        return staff ? serializeStaff(staff) : null;
    },
    async getSpecialties() {
        return prisma_1.prisma.staffspecialty.findMany({
            where: { isActive: true },
            orderBy: { name: "asc" },
        });
    },
    async create(input) {
        const createdId = await prisma_1.prisma.$transaction(async (transaction) => {
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
        return this.getById(createdId);
    },
    async update(id, input) {
        await prisma_1.prisma.$transaction(async (transaction) => {
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
        return this.getById(id);
    },
    async delete(id) {
        const staff = await prisma_1.prisma.staff.findUnique({
            where: { id },
            select: {
                _count: {
                    select: { appointment: true },
                },
            },
        });
        if (!staff) {
            throw new client_1.Prisma.PrismaClientKnownRequestError("Staff not found", {
                code: "P2025",
                clientVersion: "6.1.0",
            });
        }
        if (staff._count.appointment > 0) {
            await prisma_1.prisma.$transaction([
                prisma_1.prisma.staff.update({
                    where: { id },
                    data: { status: "inactive", updatedAt: new Date() },
                }),
                prisma_1.prisma.staffschedule.deleteMany({ where: { staffId: id } }),
                prisma_1.prisma.staffspecialtymapping.deleteMany({ where: { staffId: id } }),
            ]);
            return { archived: true };
        }
        await prisma_1.prisma.staff.delete({ where: { id } });
        return { archived: false };
    },
};
