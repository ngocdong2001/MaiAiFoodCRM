import { Prisma } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";

export const APPOINTMENT_STATUSES = ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export type AppointmentInput = {
  guestId: number;
  staffId: number;
  startTime: string;
  endTime: string;
  serviceIds: number[];
  status?: AppointmentStatus;
  priority?: "normal" | "high";
  source?: string;
  notes?: string | null;
};

export class CalendarDomainError extends Error {
  constructor(message: string, public statusCode = 400) { super(message); }
}

const include = {
  guest: { select: { id: true, name: true, phone: true, totalVisits: true, loyaltyPoints: true, notes: true } },
  staff: { select: { id: true, name: true, role: true } },
  appointmentservice: { include: { service: { select: { id: true, name: true, price: true, durationMinutes: true } } } },
  payment: { select: { id: true, finalAmount: true, paymentStatus: true } },
};

const serialize = (appointment: any) => ({
  id: appointment.id,
  guestId: appointment.guestId,
  staffId: appointment.staffId,
  startTime: appointment.startTime,
  endTime: appointment.endTime,
  status: appointment.status,
  priority: appointment.priority,
  source: appointment.source,
  notes: appointment.notes,
  cancelReason: appointment.cancelReason,
  guest: appointment.guest,
  staff: appointment.staff,
  services: appointment.appointmentservice.map((item: any) => ({ id: item.service.id, name: item.service.name, price: Number(item.priceAtBooking), durationMinutes: item.durationAtBooking ?? item.service.durationMinutes, status: item.status })),
  payment: appointment.payment ? { ...appointment.payment, finalAmount: Number(appointment.payment.finalAmount) } : null,
});

const minutesOfDay = (date: Date) => date.getHours() * 60 + date.getMinutes();
const parseTime = (value: string) => { const [hours, minutes] = value.split(":").map(Number); return hours * 60 + minutes; };

const validateRelationsAndAvailability = async (transaction: Prisma.TransactionClient, input: AppointmentInput) => {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);
  const scheduleDate = new Date(start);
  scheduleDate.setHours(0, 0, 0, 0);
  const [guest, staff, services, schedule] = await Promise.all([
    transaction.guest.findUnique({ where: { id: input.guestId }, select: { isActive: true } }),
    transaction.staff.findUnique({ where: { id: input.staffId }, select: { status: true } }),
    transaction.service.findMany({ where: { id: { in: input.serviceIds }, isActive: true } }),
    transaction.staffschedule.findUnique({ where: { staffId_date: { staffId: input.staffId, date: scheduleDate } } }),
  ]);
  if (!guest?.isActive) throw new CalendarDomainError("Guest is unavailable");
  if (!staff || staff.status === "inactive" || staff.status === "on_leave") throw new CalendarDomainError("Staff is unavailable");
  if (services.length !== new Set(input.serviceIds).size) throw new CalendarDomainError("One or more services are invalid");
  if (schedule?.isDayOff) throw new CalendarDomainError("Staff is off on the selected date", 409);
  if (schedule) {
    const startMinutes = minutesOfDay(start);
    const endMinutes = minutesOfDay(end);
    if (startMinutes < parseTime(schedule.startTime) || endMinutes > parseTime(schedule.endTime)) throw new CalendarDomainError("Appointment is outside staff working hours", 409);
    if (schedule.breakStart && schedule.breakEnd && startMinutes < parseTime(schedule.breakEnd) && endMinutes > parseTime(schedule.breakStart)) throw new CalendarDomainError("Appointment overlaps the staff break", 409);
  }
  return services;
};

const ensureNoConflict = async (transaction: Prisma.TransactionClient, input: AppointmentInput, excludeId?: number) => {
  const conflict = await transaction.appointment.findFirst({ where: { staffId: input.staffId, ...(excludeId ? { id: { not: excludeId } } : {}), status: { not: "cancelled" }, startTime: { lt: new Date(input.endTime) }, endTime: { gt: new Date(input.startTime) } } });
  if (conflict) throw new CalendarDomainError("Staff already has an appointment in this time range", 409);
};

export const CalendarModel = {
  async getAll(filters: { startDate: string; endDate: string; staffIds?: number[]; status?: AppointmentStatus }) {
    const appointments = await prisma.appointment.findMany({ where: { startTime: { gte: new Date(filters.startDate), lte: new Date(filters.endDate) }, ...(filters.staffIds?.length ? { staffId: { in: filters.staffIds } } : {}), ...(filters.status ? { status: filters.status } : {}) }, include, orderBy: { startTime: "asc" } });
    return appointments.map(serialize);
  },
  async getOptions() {
    const [guests, staff, services] = await Promise.all([
      prisma.guest.findMany({ where: { isActive: true }, select: { id: true, name: true, phone: true }, orderBy: { name: "asc" } }),
      prisma.staff.findMany({ where: { status: { notIn: ["inactive", "on_leave"] } }, select: { id: true, name: true, role: true }, orderBy: { name: "asc" } }),
      prisma.service.findMany({ where: { isActive: true }, select: { id: true, name: true, price: true, durationMinutes: true }, orderBy: { name: "asc" } }),
    ]);
    return { guests, staff, services: services.map((service) => ({ ...service, price: Number(service.price) })) };
  },
  async getById(id: number) {
    const appointment = await prisma.appointment.findUnique({ where: { id }, include });
    return appointment ? serialize(appointment) : null;
  },
  async create(input: AppointmentInput) {
    const id = await prisma.$transaction(async (transaction) => {
      const services = await validateRelationsAndAvailability(transaction, input);
      await ensureNoConflict(transaction, input);
      const appointment = await transaction.appointment.create({ data: { guestId: input.guestId, staffId: input.staffId, startTime: new Date(input.startTime), endTime: new Date(input.endTime), status: input.status ?? "pending", priority: input.priority ?? "normal", source: input.source?.trim() || "dashboard", notes: input.notes?.trim() || null, updatedAt: new Date(), appointmentservice: { create: services.map((service) => ({ serviceId: service.id, staffId: input.staffId, priceAtBooking: service.price, durationAtBooking: service.durationMinutes, status: input.status ?? "pending" })) } } });
      return appointment.id;
    });
    return this.getById(id);
  },
  async update(id: number, input: AppointmentInput) {
    await prisma.$transaction(async (transaction) => {
      const services = await validateRelationsAndAvailability(transaction, input);
      await ensureNoConflict(transaction, input, id);
      await transaction.appointment.update({ where: { id }, data: { guestId: input.guestId, staffId: input.staffId, startTime: new Date(input.startTime), endTime: new Date(input.endTime), status: input.status ?? "pending", priority: input.priority ?? "normal", source: input.source?.trim() || "dashboard", notes: input.notes?.trim() || null, updatedAt: new Date(), appointmentservice: { deleteMany: {}, create: services.map((service) => ({ serviceId: service.id, staffId: input.staffId, priceAtBooking: service.price, durationAtBooking: service.durationMinutes, status: input.status ?? "pending" })) } } });
    });
    return this.getById(id);
  },
  async updateStatus(id: number, status: AppointmentStatus, cancelReason?: string) {
    const appointment = await prisma.appointment.update({ where: { id }, data: { status, cancelReason: status === "cancelled" ? cancelReason?.trim() || "Cancelled from calendar" : null, updatedAt: new Date(), appointmentservice: { updateMany: { where: {}, data: { status } } } }, include });
    return serialize(appointment);
  },
  async delete(id: number) {
    const appointment = await prisma.appointment.findUnique({ where: { id }, select: { payment: { select: { id: true } } } });
    if (!appointment) throw new Prisma.PrismaClientKnownRequestError("Appointment not found", { code: "P2025", clientVersion: "6.1.0" });
    if (appointment.payment) { await this.updateStatus(id, "cancelled", "Cancelled while preserving payment history"); return { cancelled: true }; }
    await prisma.appointment.delete({ where: { id } });
    return { cancelled: false };
  },
};