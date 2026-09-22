import { Prisma } from "../generated/prisma-tenant/client.js";
import type { PrismaClient } from "../generated/prisma-tenant/client.js";

export type GuestSegment = "VIP" | "Loyal" | "At Risk";

export type GuestInput = {
  name: string;
  phone?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  loyaltyPoints?: number;
  smsConsent?: boolean;
  notes?: string | null;
  tagIds?: number[];
};

export type GuestListFilters = {
  search?: string;
  segment?: GuestSegment;
};

const guestInclude = {
  guesttagmapping: { include: { guesttag: true } },
  guestnote: { orderBy: [{ isPinned: "desc" as const }, { createdAt: "desc" as const }] },
  appointment: {
    orderBy: { startTime: "desc" as const },
    include: {
      staff: { select: { name: true } },
      appointmentservice: { include: { service: { select: { name: true } } } },
      payment: { select: { finalAmount: true } },
    },
  },
};

const nullableText = (value?: string | null) => value?.trim() || null;
const parseDate = (value: string) => new Date(`${value}T00:00:00.000Z`);

const getSegment = (guest: any): GuestSegment => {
  const tagNames = guest.guesttagmapping.map((mapping: any) => mapping.guesttag.name.toLowerCase());
  if (tagNames.includes("vip") || Number(guest.totalSpend) >= 3000 || guest.loyaltyPoints >= 1000) return "VIP";

  const lastAppointment = guest.appointment[0]?.startTime as Date | undefined;
  const inactiveDays = lastAppointment
    ? (Date.now() - lastAppointment.getTime()) / 86_400_000
    : (Date.now() - guest.memberSince.getTime()) / 86_400_000;
  if (tagNames.includes("at risk") || inactiveDays >= 60) return "At Risk";
  return "Loyal";
};

const serializeGuest = (guest: any) => {
  const now = new Date();
  const pastAppointments = guest.appointment.filter((item: any) => item.startTime <= now);
  const nextAppointment = [...guest.appointment]
    .filter((item: any) => item.startTime > now && item.status !== "cancelled")
    .sort((left: any, right: any) => left.startTime.getTime() - right.startTime.getTime())[0];
  const lastAppointment = pastAppointments[0];
  const notes = guest.guestnote.map((note: any) => ({
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
    smsConsent: guest.smsConsent,
    notes: guest.notes,
    tags: guest.guesttagmapping.map((mapping: any) => mapping.guesttag),
    guestNotes: notes,
    segment: getSegment(guest),
    noShows: guest.appointment.filter((item: any) => item.status === "no_show").length,
    lastVisit: lastAppointment?.startTime.toISOString() ?? null,
    nextAppointment: nextAppointment?.startTime.toISOString() ?? null,
    activities: guest.appointment.slice(0, 10).map((appointment: any) => ({
      id: appointment.id,
      type: "visit",
      title: appointment.appointmentservice.map((item: any) => item.service.name).join(", ") || "Appointment",
      amount: appointment.payment ? Number(appointment.payment.finalAmount) : 0,
      date: appointment.startTime.toISOString(),
      technician: appointment.staff.name,
      status: appointment.status,
    })),
    createdAt: guest.createdAt,
    updatedAt: guest.updatedAt,
  };
};

const inputData = (input: GuestInput) => ({
  name: input.name.trim(),
  phone: nullableText(input.phone),
  email: nullableText(input.email)?.toLowerCase() ?? null,
  avatarUrl: nullableText(input.avatarUrl),
  gender: nullableText(input.gender),
  dateOfBirth: input.dateOfBirth ? parseDate(input.dateOfBirth) : null,
  loyaltyPoints: input.loyaltyPoints ?? 0,
  smsConsent: input.smsConsent ?? false,
  notes: nullableText(input.notes),
  updatedAt: new Date(),
});

export const CRMModel = {
  async getAll(db: PrismaClient, filters: GuestListFilters = {}) {
    const where: Prisma.guestWhereInput = {
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
    const guests = await db.guest.findMany({ where, include: guestInclude, orderBy: { name: "asc" } });
    const serialized = guests.map(serializeGuest);
    return filters.segment ? serialized.filter((guest) => guest.segment === filters.segment) : serialized;
  },

  async getById(db: PrismaClient, id: number) {
    const guest = await db.guest.findUnique({ where: { id }, include: guestInclude });
    return guest ? serializeGuest(guest) : null;
  },

  async getTags(db: PrismaClient) {
    return db.guesttag.findMany({ where: { isActive: true }, orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  },

  async create(db: PrismaClient, input: GuestInput) {
    const guest = await db.guest.create({
      data: {
        ...inputData(input),
        ...(input.tagIds?.length
          ? { guesttagmapping: { create: input.tagIds.map((tagId) => ({ tagId })) } }
          : {}),
      },
    });
    return this.getById(db, guest.id);
  },

  async update(db: PrismaClient, id: number, input: GuestInput) {
    await db.guest.update({
      where: { id },
      data: {
        ...inputData(input),
        guesttagmapping: {
          deleteMany: {},
          create: (input.tagIds ?? []).map((tagId) => ({ tagId })),
        },
      },
    });
    return this.getById(db, id);
  },

  async updateNotes(db: PrismaClient, id: number, content: string, author?: string) {
    await db.$transaction([
      db.guest.update({ where: { id }, data: { notes: content, updatedAt: new Date() } }),
      db.guestnote.create({
        data: { guestId: id, content, author: nullableText(author), isPinned: true, updatedAt: new Date() },
      }),
    ]);
    return this.getById(db, id);
  },

  async delete(db: PrismaClient, id: number) {
    const guest = await db.guest.findUnique({
      where: { id },
      select: { _count: { select: { appointment: true, payment: true, airecommendation: true } } },
    });
    if (!guest) {
      throw new Prisma.PrismaClientKnownRequestError("Guest not found", { code: "P2025", clientVersion: "6.1.0" });
    }
    const hasHistory = guest._count.appointment > 0 || guest._count.payment > 0 || guest._count.airecommendation > 0;
    if (hasHistory) {
      await db.guest.update({ where: { id }, data: { isActive: false, updatedAt: new Date() } });
      return { archived: true };
    }
    await db.guest.delete({ where: { id } });
    return { archived: false };
  },

  /**
   * Find guest by phone number (normalized).
   * Returns serialized guest with recent services for voice agent lookup.
   */
  async getByPhone(db: PrismaClient, phone: string) {
    // Normalize phone: remove +, spaces, dashes
    const normalized = phone.replace(/[^0-9]/g, "").trim();
    if (!normalized) return null;

    const guest = await db.guest.findFirst({
      where: {
        phone: { contains: normalized },
        isActive: true,
      },
      include: guestInclude,
    });
    if (!guest) return null;

    const serialized = serializeGuest(guest);

    // Add recent services for voice agent context
    const recentServices = guest.appointment
      .filter((apt: any) => apt.status !== "cancelled")
      .slice(0, 5)
      .flatMap((apt: any) =>
        apt.appointmentservice.map((s: any) => s.service.name)
      )
      .filter((name: string, idx: number, arr: string[]) => arr.indexOf(name) === idx);

    return {
      ...serialized,
      recentServices,
      lastVisit: serialized.lastVisit,
      nextAppointment: serialized.nextAppointment,
    };
  },
};
