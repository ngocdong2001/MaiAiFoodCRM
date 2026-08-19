import { Prisma } from "../generated/prisma-tenant/client.js";
import type { PrismaClient } from "../generated/prisma-tenant/client.js";

export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
] as const;
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
  constructor(
    message: string,
    public statusCode = 400,
  ) {
    super(message);
  }
}

const include = {
  guest: {
    select: {
      id: true,
      name: true,
      phone: true,
      totalVisits: true,
      loyaltyPoints: true,
      notes: true,
    },
  },
  staff: { select: { id: true, name: true, role: true } },
  appointmentservice: {
    include: {
      service: {
        select: { id: true, name: true, price: true, durationMinutes: true },
      },
    },
  },
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
  services: appointment.appointmentservice.map((item: any) => ({
    id: item.service.id,
    name: item.service.name,
    price: Number(item.priceAtBooking),
    durationMinutes: item.durationAtBooking ?? item.service.durationMinutes,
    status: item.status,
  })),
  payment: appointment.payment
    ? {
        ...appointment.payment,
        finalAmount: Number(appointment.payment.finalAmount),
      }
    : null,
});

const parseTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

// Extract minutes-of-day directly from datetime string to avoid timezone bugs
const timeStringMinutes = (datetimeStr: string): number => {
  const match = datetimeStr.match(/T(\d{2}):(\d{2})/);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
};

// Use UTC noon so date never shifts across timezone boundaries
const dayNameFromDateStr = (datePart: string): string => {
  const idx = new Date(`${datePart}T12:00:00Z`).getUTCDay();
  return [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ][idx];
};

type DayHours = { day: string; open: boolean; from: string; to: string };

const validateRelationsAndAvailability = async (
  transaction: Prisma.TransactionClient,
  input: AppointmentInput,
) => {
  // Parse date part from string to avoid timezone-shifting scheduleDate
  const datePart = input.startTime.slice(0, 10);
  const scheduleDate = new Date(`${datePart}T00:00:00.000Z`);

  const [guest, staff, services, schedule, storeHoursSetting] =
    await Promise.all([
      transaction.guest.findUnique({
        where: { id: input.guestId },
        select: { isActive: true },
      }),
      transaction.staff.findUnique({
        where: { id: input.staffId },
        select: { status: true },
      }),
      transaction.service.findMany({
        where: { id: { in: input.serviceIds }, isActive: true },
      }),
      transaction.staffschedule.findUnique({
        where: { staffId_date: { staffId: input.staffId, date: scheduleDate } },
      }),
      transaction.setting.findUnique({ where: { key: "operating_hours" } }),
    ]);

  if (!guest?.isActive) throw new CalendarDomainError("Guest is unavailable");
  if (!staff || staff.status === "inactive" || staff.status === "on_leave")
    throw new CalendarDomainError("Staff is unavailable");
  if (services.length !== new Set(input.serviceIds).size)
    throw new CalendarDomainError("One or more services are invalid");

  const bookingStart = timeStringMinutes(input.startTime);
  const bookingEnd = timeStringMinutes(input.endTime);

  // Validate against store operating hours
  let storeHours: DayHours[] | null = null;
  if (storeHoursSetting?.value) {
    try {
      storeHours = JSON.parse(storeHoursSetting.value) as DayHours[];
    } catch {
      /* ignore */
    }
  }
  if (storeHours) {
    const dayName = dayNameFromDateStr(datePart);
    const dayConfig = storeHours.find((d) => d.day === dayName);
    if (!dayConfig || !dayConfig.open)
      throw new CalendarDomainError("Store is closed on the selected day", 409);
    if (
      bookingStart < parseTime(dayConfig.from) ||
      bookingEnd > parseTime(dayConfig.to)
    )
      throw new CalendarDomainError(
        "Appointment is outside store operating hours",
        409,
      );
  }

  if (schedule?.isDayOff)
    throw new CalendarDomainError("Staff is off on the selected date", 409);
  if (schedule) {
    if (
      bookingStart < parseTime(schedule.startTime) ||
      bookingEnd > parseTime(schedule.endTime)
    )
      throw new CalendarDomainError(
        "Appointment is outside staff working hours",
        409,
      );
    if (schedule.breakStart && schedule.breakEnd) {
      const breakS = parseTime(schedule.breakStart);
      const breakE = parseTime(schedule.breakEnd);
      // Only validate if break data is coherent and within the shift
      if (
        breakS < breakE &&
        breakS >= parseTime(schedule.startTime) &&
        breakE <= parseTime(schedule.endTime) &&
        bookingStart < breakE &&
        bookingEnd > breakS
      )
        throw new CalendarDomainError(
          `Appointment overlaps the staff break (${schedule.breakStart}–${schedule.breakEnd})`,
          409,
        );
    }
  }
  return services;
};

const ensureNoConflict = async (
  transaction: Prisma.TransactionClient,
  input: AppointmentInput,
  excludeId?: number,
) => {
  const conflict = await transaction.appointment.findFirst({
    where: {
      staffId: input.staffId,
      ...(excludeId ? { id: { not: excludeId } } : {}),
      status: { not: "cancelled" },
      startTime: { lt: new Date(input.endTime) },
      endTime: { gt: new Date(input.startTime) },
    },
  });
  if (conflict)
    throw new CalendarDomainError(
      "Staff already has an appointment in this time range",
      409,
    );
};

export const CalendarModel = {
  async getAll(
    db: PrismaClient,
    filters: {
      startDate: string;
      endDate: string;
      staffIds?: number[];
      status?: AppointmentStatus;
    },
  ) {
    const appointments = await db.appointment.findMany({
      where: {
        startTime: {
          gte: new Date(filters.startDate),
          lte: new Date(filters.endDate),
        },
        ...(filters.staffIds?.length
          ? { staffId: { in: filters.staffIds } }
          : {}),
        ...(filters.status ? { status: filters.status } : {}),
      },
      include,
      orderBy: { startTime: "asc" },
    });
    const schedulePairs = Array.from(
      new Set(
        appointments.map(
          (appointment) =>
            `${appointment.staffId}::${appointment.startTime.toISOString().slice(0, 10)}`,
        ),
      ),
    ).map((key) => {
      const [staffIdRaw, dateRaw] = key.split("::");
      return {
        staffId: Number(staffIdRaw),
        date: new Date(`${dateRaw}T00:00:00.000Z`),
      };
    });

    const schedules = schedulePairs.length
      ? await db.staffschedule.findMany({
          where: { OR: schedulePairs },
          select: { staffId: true, date: true, note: true },
        })
      : [];

    const scheduleMap = new Map(
      schedules.map((schedule) => [
        `${schedule.staffId}-${schedule.date.toISOString().slice(0, 10)}`,
        schedule.note,
      ]),
    );

    return appointments.map((appointment) => {
      const payload = serialize(appointment);
      const dateKey = appointment.startTime.toISOString().slice(0, 10);
      const station =
        scheduleMap.get(`${appointment.staffId}-${dateKey}`) ?? null;
      return {
        ...payload,
        station,
      };
    });
  },
  async getOptions(db: PrismaClient) {
    // Use UTC midnight so the date lookup matches staffschedule rows stored as UTC dates
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayStart = new Date(`${todayStr}T00:00:00.000Z`);

    const [guests, staff, services, storeHoursSetting] = await Promise.all([
      db.guest.findMany({
        where: { isActive: true },
        select: { id: true, name: true, phone: true },
        orderBy: { name: "asc" },
      }),
      db.staff.findMany({
        where: { status: { notIn: ["inactive", "on_leave"] } },
        select: {
          id: true,
          name: true,
          role: true,
          staffschedule: {
            where: { date: todayStart },
            select: {
              startTime: true,
              endTime: true,
              breakStart: true,
              breakEnd: true,
              isDayOff: true,
            },
            take: 1,
          },
        },
        orderBy: { name: "asc" },
      }),
      db.service.findMany({
        where: { isActive: true },
        select: { id: true, name: true, price: true, durationMinutes: true },
        orderBy: { name: "asc" },
      }),
      db.setting.findUnique({ where: { key: "operating_hours" } }),
    ]);
    let operatingHours: DayHours[] | null = null;
    if (storeHoursSetting?.value) {
      try {
        operatingHours = JSON.parse(storeHoursSetting.value) as DayHours[];
      } catch {
        /* ignore */
      }
    }
    return {
      guests,
      staff: staff.map((s) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        todaySchedule: s.staffschedule[0] ?? null,
      })),
      services: services.map((service) => ({
        ...service,
        price: Number(service.price),
      })),
      operatingHours,
    };
  },
  async getById(db: PrismaClient, id: number) {
    const appointment = await db.appointment.findUnique({
      where: { id },
      include,
    });
    return appointment ? serialize(appointment) : null;
  },
  async create(db: PrismaClient, input: AppointmentInput) {
    const id = await db.$transaction(async (transaction) => {
      const services = await validateRelationsAndAvailability(
        transaction,
        input,
      );
      await ensureNoConflict(transaction, input);
      const appointment = await transaction.appointment.create({
        data: {
          guestId: input.guestId,
          staffId: input.staffId,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          status: input.status ?? "pending",
          priority: input.priority ?? "normal",
          source: input.source?.trim() || "dashboard",
          notes: input.notes?.trim() || null,
          updatedAt: new Date(),
          appointmentservice: {
            create: services.map(
              (service: {
                id: number;
                price: any;
                durationMinutes: number;
              }) => ({
                serviceId: service.id,
                staffId: input.staffId,
                priceAtBooking: service.price,
                durationAtBooking: service.durationMinutes,
                status: input.status ?? "pending",
              }),
            ),
          },
        },
      });
      return appointment.id;
    });
    return this.getById(db, id);
  },
  async update(db: PrismaClient, id: number, input: AppointmentInput) {
    await db.$transaction(async (transaction) => {
      const services = await validateRelationsAndAvailability(
        transaction,
        input,
      );
      await ensureNoConflict(transaction, input, id);
      await transaction.appointment.update({
        where: { id },
        data: {
          guestId: input.guestId,
          staffId: input.staffId,
          startTime: new Date(input.startTime),
          endTime: new Date(input.endTime),
          status: input.status ?? "pending",
          priority: input.priority ?? "normal",
          source: input.source?.trim() || "dashboard",
          notes: input.notes?.trim() || null,
          updatedAt: new Date(),
          appointmentservice: {
            deleteMany: {},
            create: services.map(
              (service: {
                id: number;
                price: any;
                durationMinutes: number;
              }) => ({
                serviceId: service.id,
                staffId: input.staffId,
                priceAtBooking: service.price,
                durationAtBooking: service.durationMinutes,
                status: input.status ?? "pending",
              }),
            ),
          },
        },
      });
    });
    return this.getById(db, id);
  },
  async updateStatus(
    db: PrismaClient,
    id: number,
    status: AppointmentStatus,
    cancelReason?: string,
  ) {
    const appointment = await db.appointment.update({
      where: { id },
      data: {
        status,
        cancelReason:
          status === "cancelled"
            ? cancelReason?.trim() || "Cancelled from calendar"
            : null,
        updatedAt: new Date(),
        appointmentservice: { updateMany: { where: {}, data: { status } } },
      },
      include,
    });
    return serialize(appointment);
  },
  async delete(db: PrismaClient, id: number) {
    const appointment = await db.appointment.findUnique({
      where: { id },
      select: { payment: { select: { id: true } } },
    });
    if (!appointment)
      throw new Prisma.PrismaClientKnownRequestError("Appointment not found", {
        code: "P2025",
        clientVersion: "6.1.0",
      });
    if (appointment.payment) {
      await this.updateStatus(
        db,
        id,
        "cancelled",
        "Cancelled while preserving payment history",
      );
      return { cancelled: true };
    }
    await db.appointment.delete({ where: { id } });
    return { cancelled: false };
  },
};
