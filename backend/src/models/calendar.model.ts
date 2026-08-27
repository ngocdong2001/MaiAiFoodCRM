import { Prisma } from "../generated/prisma-tenant/client.js";
import type { PrismaClient } from "../generated/prisma-tenant/client.js";
import { resolveDayScheduleFromWeekly, type DaySchedule } from "./schedule.helpers.js";

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

// Convert a UTC datetime string to salon-local minutes-of-day.
// Used when comparing UTC-stored appointment times against local-time break/schedule.
const utcToLocalMinutes = (datetimeStr: string, tzOffsetMinutes: number): number => {
  const match = datetimeStr.match(/T(\d{2}):(\d{2})/);
  if (!match) return 0;
  const utcMinutes = Number(match[1]) * 60 + Number(match[2]);
  const localMinutes = utcMinutes + tzOffsetMinutes;
  // Handle day wraparound
  return ((localMinutes % 1440) + 1440) % 1440;
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

// Idempotently creates the Payment + PaymentDetail rows for a completed booking.
// Safe to call repeatedly: never duplicates Payment or PaymentDetail rows.
const ensurePaymentForCompletedAppointment = async (
  transaction: Prisma.TransactionClient,
  appointment: { id: number; guestId: number; staffId: number },
) => {
  const services = await transaction.appointmentservice.findMany({
    where: { appointmentId: appointment.id },
  });
  if (services.length === 0) {
    throw new CalendarDomainError(
      "Cannot mark a booking with no services as completed",
    );
  }

  const totalAmount = services.reduce(
    (sum, item) => sum + Number(item.priceAtBooking),
    0,
  );

  let payment = await transaction.payment.findUnique({
    where: { appointmentId: appointment.id },
  });

  if (!payment) {
    try {
      payment = await transaction.payment.create({
        data: {
          appointmentId: appointment.id,
          guestId: appointment.guestId,
          staffId: appointment.staffId,
          amount: totalAmount,
          finalAmount: totalAmount,
          paymentMethod: "cash",
          paymentStatus: "paid",
        },
      });
    } catch (error) {
      // Concurrent request already created it — recover instead of duplicating.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        payment = await transaction.payment.findUniqueOrThrow({
          where: { appointmentId: appointment.id },
        });
      } else {
        throw error;
      }
    }
  }

  const existingDetails = await transaction.paymentdetail.findMany({
    where: { paymentId: payment.id },
    select: { serviceId: true },
  });
  const existingServiceIds = new Set(existingDetails.map((d) => d.serviceId));
  const missingServices = services.filter(
    (item) => !existingServiceIds.has(item.serviceId),
  );

  if (missingServices.length > 0) {
    await transaction.paymentdetail.createMany({
      data: missingServices.map((item) => ({
        paymentId: payment!.id,
        serviceId: item.serviceId,
        price: item.priceAtBooking,
        quantity: 1,
      })),
      skipDuplicates: true,
    });
  }
};

const validateRelationsAndAvailability = async (
  transaction: Prisma.TransactionClient,
  input: AppointmentInput,
) => {
  // Parse date part from string to avoid timezone-shifting scheduleDate
  const datePart = input.startTime.slice(0, 10);
  const scheduleDate = new Date(`${datePart}T00:00:00.000Z`);

  const [guest, staff, services, overrideSchedule, storeHoursSetting, salonTzRow] =
    await Promise.all([
      transaction.guest.findUnique({
        where: { id: input.guestId },
        select: { isActive: true },
      }),
      transaction.staff.findUnique({
        where: { id: input.staffId },
        select: { status: true, weeklySchedule: true },
      }),
      transaction.service.findMany({
        where: { id: { in: input.serviceIds }, isActive: true },
      }),
      transaction.staffschedule.findUnique({
        where: { staffId_date: { staffId: input.staffId, date: scheduleDate } },
      }),
      transaction.setting.findUnique({ where: { key: "operating_hours" } }),
      transaction.setting.findUnique({ where: { key: "salon_timezone" } }),
    ]);

  if (!guest?.isActive) throw new CalendarDomainError("Guest is unavailable");
  if (!staff || staff.status === "inactive" || staff.status === "on_leave")
    throw new CalendarDomainError("Staff is unavailable");
  if (services.length !== new Set(input.serviceIds).size)
    throw new CalendarDomainError("One or more services are invalid");

  // Resolve salon timezone offset for converting UTC appointment times to local.
  // Break schedules and working hours are stored in local time, but appointments
  // are stored in UTC. We need to convert UTC → local for accurate comparison.
  let salonTzOffsetMinutes = 0;
  try {
    // salon_timezone key stores the raw timezone string, e.g. "America/Halifax"
    const salonTz = salonTzRow?.value || "UTC";
    // Compute UTC offset for the salon timezone on the booking date
    const localNoon = new Date(`${datePart}T12:00:00`);
    const tzDate = new Date(localNoon.toLocaleString("en-US", { timeZone: salonTz }));
    salonTzOffsetMinutes = (tzDate.getTime() - localNoon.getTime()) / 60000;
    process.stderr.write(`[BREAK-CHECK] salon_tz=${salonTz} offset=${salonTzOffsetMinutes}min salonTzRow=${!!salonTzRow}\n`);
  } catch {
    salonTzOffsetMinutes = 0;
    process.stderr.write(`[BREAK-CHECK] timezone lookup FAILED, defaulting to UTC offset=0\n`);
  }

  // Convert UTC booking times to local minutes for comparison with local schedules
  const bookingStart = utcToLocalMinutes(input.startTime, salonTzOffsetMinutes);
  const bookingEnd = utcToLocalMinutes(input.endTime, salonTzOffsetMinutes);
  process.stderr.write(`[BREAK-CHECK] startTime=${input.startTime} endTime=${input.endTime} → local: ${bookingStart}-${bookingEnd} min | break would be 720-780\n`);

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

  // Resolve staff schedule: override > weekly template > error
  let resolvedSchedule: DaySchedule | null = null;

  if (overrideSchedule?.isDayOff) {
    throw new CalendarDomainError("Staff is off on the selected date", 409);
  }

  if (overrideSchedule) {
    // Per-day override takes priority
    resolvedSchedule = {
      startTime: overrideSchedule.startTime,
      endTime: overrideSchedule.endTime,
      breakStart: overrideSchedule.breakStart,
      breakEnd: overrideSchedule.breakEnd,
      station: overrideSchedule.note,
    };
  } else if (staff?.weeklySchedule) {
    // Fallback to weekly template
    resolvedSchedule = resolveDayScheduleFromWeekly(
      staff.weeklySchedule as any,
      datePart,
    );
  }

  // No schedule found means staff not available
  if (!resolvedSchedule) {
    throw new CalendarDomainError("Staff has no working schedule for the selected date", 409);
  }

  // Validate booking against resolved schedule
  if (
    bookingStart < parseTime(resolvedSchedule.startTime) ||
    bookingEnd > parseTime(resolvedSchedule.endTime)
  )
    throw new CalendarDomainError(
      "Appointment is outside staff working hours",
      409,
    );

  if (resolvedSchedule.breakStart && resolvedSchedule.breakEnd) {
    const breakS = parseTime(resolvedSchedule.breakStart);
    const breakE = parseTime(resolvedSchedule.breakEnd);
    // Only validate if break data is coherent and within the shift
    if (
      breakS < breakE &&
      breakS >= parseTime(resolvedSchedule.startTime) &&
      breakE <= parseTime(resolvedSchedule.endTime) &&
      bookingStart < breakE &&
      bookingEnd > breakS
    )
      throw new CalendarDomainError(
        `Appointment overlaps the staff break (${resolvedSchedule.breakStart}–${resolvedSchedule.breakEnd})`,
        409,
      );
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
        select: {
          id: true,
          name: true,
          price: true,
          durationMinutes: true,
          servicecategory: { select: { name: true } },
        },
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
        category: service.servicecategory?.name ?? null,
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
      const updated = await transaction.appointment.update({
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

      if (updated.status === "completed") {
        await ensurePaymentForCompletedAppointment(transaction, updated);
      }
    });
    return this.getById(db, id);
  },
  async updateStatus(
    db: PrismaClient,
    id: number,
    status: AppointmentStatus,
    cancelReason?: string,
  ) {
    const appointment = await db.$transaction(async (transaction) => {
      const updated = await transaction.appointment.update({
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
      });

      if (status === "completed") {
        await ensurePaymentForCompletedAppointment(transaction, updated);
      }

      return transaction.appointment.findUniqueOrThrow({
        where: { id },
        include,
      });
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

  async getAvailability(
    db: PrismaClient,
    params: {
      date: string;
      service?: string;
      staffId?: number;
      preferredTime?: string;
    },
  ) {
    const targetDate = new Date(`${params.date}T00:00:00.000Z`);
    const dayOfWeek = targetDate.getDay();

    // Resolve salon timezone offset for converting local slots to UTC
    const salonTzRow = await db.setting.findUnique({ where: { key: "salon_timezone" } });
    let salonTzOffsetMinutes = 0;
    try {
      const salonTz = salonTzRow?.value || "UTC";
      const localNoon = new Date(`${params.date}T12:00:00`);
      const tzDate = new Date(localNoon.toLocaleString("en-US", { timeZone: salonTz }));
      salonTzOffsetMinutes = (tzDate.getTime() - localNoon.getTime()) / 60000;
    } catch {
      salonTzOffsetMinutes = 0;
    }

    // Get active staff with their weeklySchedule template
    const staffList = await db.staff.findMany({
      where: { status: { notIn: ["inactive", "on_leave"] } },
      select: { id: true, name: true, role: true, weeklySchedule: true },
    });

    const staffIds = staffList.map((s) => s.id);
    if (params.staffId && staffIds.includes(params.staffId)) {
      // filter to requested staff only
    }

    const effectiveStaffIds = params.staffId
      ? staffIds.filter((id) => id === params.staffId)
      : staffIds;

    // Get per-date overrides from staffschedule
    const schedules = await db.staffschedule.findMany({
      where: {
        staffId: { in: effectiveStaffIds },
        date: targetDate,
      },
    });

    const overrideMap = new Map(
      schedules.map((s) => [
        s.staffId,
        {
          startTime: s.startTime,
          endTime: s.endTime,
          isDayOff: s.isDayOff,
          breakStart: s.breakStart,
          breakEnd: s.breakEnd,
        },
      ]),
    );

    // Resolve schedule per staff: per-date override > weeklySchedule template
    const datePart = params.date;
    const scheduleMap = new Map<number, { startTime: string; endTime: string; isDayOff: boolean; breakStart: string | null; breakEnd: string | null }>();
    for (const staff of staffList) {
      if (!effectiveStaffIds.includes(staff.id)) continue;

      const override = overrideMap.get(staff.id);
      if (override) {
        // Per-date override takes priority
        scheduleMap.set(staff.id, override);
      } else if (staff.weeklySchedule) {
        // Fallback to weekly template
        const resolved = resolveDayScheduleFromWeekly(staff.weeklySchedule as any, datePart);
        if (resolved) {
          scheduleMap.set(staff.id, {
            startTime: resolved.startTime,
            endTime: resolved.endTime,
            isDayOff: false,
            breakStart: resolved.breakStart ?? null,
            breakEnd: resolved.breakEnd ?? null,
          });
        }
      }
    }

    // Get existing appointments for the date
    const dayStart = new Date(`${params.date}T00:00:00.000Z`);
    const dayEnd = new Date(`${params.date}T23:59:59.999Z`);
    const existingAppointments = await db.appointment.findMany({
      where: {
        staffId: { in: effectiveStaffIds },
        status: { notIn: ["cancelled"] },
        startTime: { gte: dayStart, lte: dayEnd },
      },
      select: { staffId: true, startTime: true, endTime: true },
    });

    // Find service duration if specified
    let durationMinutes = 30; // default
    if (params.service) {
      const services = await db.service.findMany({
        where: { isActive: true },
        select: { name: true, durationMinutes: true },
      });
      const match = services.find(s => s.name.toLowerCase().includes(params.service!.toLowerCase()));
      if (match) durationMinutes = match.durationMinutes;
    }

    // Generate available slots for each staff member
    const availableSlots: Array<{
      time: string;
      end_time: string;
      staff_id: number;
      staff_name: string;
    }> = [];

    for (const staff of staffList) {
      if (!effectiveStaffIds.includes(staff.id)) continue;
      const schedule = scheduleMap.get(staff.id);
      if (!schedule || schedule.isDayOff) continue;

      const staffStart = parseTime(schedule.startTime);
      const staffEnd = parseTime(schedule.endTime);
      const breakStart = schedule.breakStart ? parseTime(schedule.breakStart) : null;
      const breakEnd = schedule.breakEnd ? parseTime(schedule.breakEnd) : null;

      // Get staff's appointments for the day
      const staffAppts = existingAppointments.filter((a) => a.staffId === staff.id);

      // Generate 30-min slots within working hours
      for (let startMin = staffStart; startMin + durationMinutes <= staffEnd; startMin += 30) {
        const endMin = startMin + durationMinutes;

        // Check break overlap (both in local time — no conversion needed)
        if (
          breakStart !== null &&
          breakEnd !== null &&
          startMin < breakEnd &&
          endMin > breakStart
        ) {
          continue;
        }

        // Check appointment overlap — convert local slot to UTC for comparison
        // with UTC-stored existing appointments
        const slotStartUtc = new Date(`${params.date}T00:00:00.000Z`);
        slotStartUtc.setMinutes(startMin - salonTzOffsetMinutes);
        const slotEndUtc = new Date(`${params.date}T00:00:00.000Z`);
        slotEndUtc.setMinutes(endMin - salonTzOffsetMinutes);

        const hasConflict = staffAppts.some((appt) => {
          const apptStart = new Date(appt.startTime);
          const apptEnd = new Date(appt.endTime);
          return apptStart < slotEndUtc && apptEnd > slotStartUtc;
        });

        if (!hasConflict) {
          const hours = Math.floor(startMin / 60);
          const mins = startMin % 60;
          const endHours = Math.floor(endMin / 60);
          const endMins = endMin % 60;
          availableSlots.push({
            time: `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`,
            end_time: `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`,
            staff_id: staff.id,
            staff_name: staff.name,
          });
        }
      }
    }

    // Check preferred_time if specified
    let preferredAvailable = undefined;
    if (params.preferredTime) {
      preferredAvailable = availableSlots.some(
        (slot) => slot.time === params.preferredTime,
      );
    }

    // Suggest times: first available per staff
    const suggestedTimes: string[] = [];
    const seenStaff = new Set<number>();
    for (const slot of availableSlots) {
      if (!seenStaff.has(slot.staff_id)) {
        seenStaff.add(slot.staff_id);
        suggestedTimes.push(slot.time);
      }
    }

    return {
      date: params.date,
      available: availableSlots.length > 0,
      available_slots: availableSlots,
      suggested_times: suggestedTimes,
      ...(params.preferredTime ? { preferred_time: params.preferredTime, available: preferredAvailable } : {}),
    };
  },
};
