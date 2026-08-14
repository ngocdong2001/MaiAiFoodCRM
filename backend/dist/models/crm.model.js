"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRMModel = void 0;
const client_1 = require("../generated/prisma/client");
const prisma_1 = require("../lib/prisma");
const guestInclude = {
    guesttagmapping: { include: { guesttag: true } },
    guestnote: { orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }] },
    appointment: {
        orderBy: { startTime: "desc" },
        include: {
            staff: { select: { name: true } },
            appointmentservice: { include: { service: { select: { name: true } } } },
            payment: { select: { finalAmount: true } },
        },
    },
};
const nullableText = (value) => value?.trim() || null;
const parseDate = (value) => new Date(`${value}T00:00:00.000Z`);
const getSegment = (guest) => {
    const tagNames = guest.guesttagmapping.map((mapping) => mapping.guesttag.name.toLowerCase());
    if (tagNames.includes("vip") || Number(guest.totalSpend) >= 3000 || guest.loyaltyPoints >= 1000)
        return "VIP";
    const lastAppointment = guest.appointment[0]?.startTime;
    const inactiveDays = lastAppointment
        ? (Date.now() - lastAppointment.getTime()) / 86400000
        : (Date.now() - guest.memberSince.getTime()) / 86400000;
    if (tagNames.includes("at risk") || inactiveDays >= 60)
        return "At Risk";
    return "Loyal";
};
const serializeGuest = (guest) => {
    const now = new Date();
    const pastAppointments = guest.appointment.filter((item) => item.startTime <= now);
    const nextAppointment = [...guest.appointment]
        .filter((item) => item.startTime > now && item.status !== "cancelled")
        .sort((left, right) => left.startTime.getTime() - right.startTime.getTime())[0];
    const lastAppointment = pastAppointments[0];
    const notes = guest.guestnote.map((note) => ({
        id: note.id,
        content: note.content,
        author: note.author,
        isPinned: note.isPinned,
        createdAt: note.createdAt,
    }));
    return {
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        email: guest.email,
        avatarUrl: guest.avatarUrl,
        gender: guest.gender,
        dateOfBirth: guest.dateOfBirth?.toISOString().slice(0, 10) ?? null,
        totalVisits: guest.totalVisits,
        totalSpend: Number(guest.totalSpend),
        loyaltyPoints: guest.loyaltyPoints,
        memberSince: guest.memberSince.toISOString().slice(0, 10),
        isActive: guest.isActive,
        notes: guest.notes,
        tags: guest.guesttagmapping.map((mapping) => mapping.guesttag),
        guestNotes: notes,
        segment: getSegment(guest),
        noShows: guest.appointment.filter((item) => item.status === "no_show").length,
        lastVisit: lastAppointment?.startTime.toISOString() ?? null,
        nextAppointment: nextAppointment?.startTime.toISOString() ?? null,
        activities: guest.appointment.slice(0, 10).map((appointment) => ({
            id: appointment.id,
            type: "visit",
            title: appointment.appointmentservice.map((item) => item.service.name).join(", ") || "Appointment",
            amount: appointment.payment ? Number(appointment.payment.finalAmount) : 0,
            date: appointment.startTime.toISOString(),
            technician: appointment.staff.name,
            status: appointment.status,
        })),
        createdAt: guest.createdAt,
        updatedAt: guest.updatedAt,
    };
};
const inputData = (input) => ({
    name: input.name.trim(),
    phone: nullableText(input.phone),
    email: nullableText(input.email)?.toLowerCase() ?? null,
    avatarUrl: nullableText(input.avatarUrl),
    gender: nullableText(input.gender),
    dateOfBirth: input.dateOfBirth ? parseDate(input.dateOfBirth) : null,
    loyaltyPoints: input.loyaltyPoints ?? 0,
    notes: nullableText(input.notes),
    updatedAt: new Date(),
});
exports.CRMModel = {
    async getAll(filters = {}) {
        const where = {
            isActive: true,
            ...(filters.search
                ? {
                    OR: [
                        { name: { contains: filters.search } },
                        { phone: { contains: filters.search } },
                        { email: { contains: filters.search } },
                        { guesttagmapping: { some: { guesttag: { name: { contains: filters.search } } } } },
                    ],
                }
                : {}),
        };
        const guests = await prisma_1.prisma.guest.findMany({ where, include: guestInclude, orderBy: { name: "asc" } });
        const serialized = guests.map(serializeGuest);
        return filters.segment ? serialized.filter((guest) => guest.segment === filters.segment) : serialized;
    },
    async getById(id) {
        const guest = await prisma_1.prisma.guest.findUnique({ where: { id }, include: guestInclude });
        return guest ? serializeGuest(guest) : null;
    },
    async getTags() {
        return prisma_1.prisma.guesttag.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
    },
    async create(input) {
        const guest = await prisma_1.prisma.guest.create({
            data: {
                ...inputData(input),
                ...(input.tagIds?.length
                    ? { guesttagmapping: { create: input.tagIds.map((tagId) => ({ tagId })) } }
                    : {}),
            },
        });
        return this.getById(guest.id);
    },
    async update(id, input) {
        await prisma_1.prisma.guest.update({
            where: { id },
            data: {
                ...inputData(input),
                guesttagmapping: {
                    deleteMany: {},
                    create: (input.tagIds ?? []).map((tagId) => ({ tagId })),
                },
            },
        });
        return this.getById(id);
    },
    async updateNotes(id, content, author) {
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.guest.update({ where: { id }, data: { notes: content, updatedAt: new Date() } }),
            prisma_1.prisma.guestnote.create({
                data: { guestId: id, content, author: nullableText(author), isPinned: true, updatedAt: new Date() },
            }),
        ]);
        return this.getById(id);
    },
    async delete(id) {
        const guest = await prisma_1.prisma.guest.findUnique({
            where: { id },
            select: { _count: { select: { appointment: true, payment: true, airecommendation: true } } },
        });
        if (!guest) {
            throw new client_1.Prisma.PrismaClientKnownRequestError("Guest not found", { code: "P2025", clientVersion: "6.1.0" });
        }
        const hasHistory = guest._count.appointment > 0 || guest._count.payment > 0 || guest._count.airecommendation > 0;
        if (hasHistory) {
            await prisma_1.prisma.guest.update({ where: { id }, data: { isActive: false, updatedAt: new Date() } });
            return { archived: true };
        }
        await prisma_1.prisma.guest.delete({ where: { id } });
        return { archived: false };
    },
};
