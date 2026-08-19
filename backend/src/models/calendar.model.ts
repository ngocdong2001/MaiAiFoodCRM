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

const minutesOfDay = (date: Date) => date.getHours() * 60 + date.getMinutes();
const parseTime = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const validateRelationsAndAvailability = async (
  transaction: Prisma.TransactionClient,
  input: AppointmentInput,
) => {
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);
  const scheduleDate = new Date(start);
  scheduleDate.setHours(0, 0, 0, 0);
  const [guest, staff, services, schedule] = await Promise.all([
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
  ]);
  if (!guest?.isActive) throw new CalendarDomainError("Guest is unavailable");
  if (!staff || staff.status === "inactive" || staff.status === "on_leave")
    throw new CalendarDomainError("Staff is unavailable");
  if (services.length !== new Set(input.serviceIds).size)
    throw new CalendarDomainError("One or more services are invalid");
  if (schedule?.isDayOff)
    throw new CalendarDomainError("Staff is off on the selected date", 409);
  if (schedule) {
    const startMinutes = minutesOfDay(start);
    const endMinutes = minutesOfDay(end);
    if (
      startMinutes < parseTime(schedule.startTime) ||
      endMinutes > parseTime(schedule.endTime)
    )
      throw new CalendarDomainError(
        "Appointment is outside staff working hours",
        409,
      );
    if (
      schedule.breakStart &&
      schedule.breakEnd &&
      startMinutes < parseTime(schedule.breakEnd) &&
      endMinutes > parseTime(schedule.breakStart)
    )
      throw new CalendarDomainError(
        "Appointment overlaps the staff break",
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
  async getAll(db: PrismaClient, filters: {
    startDate: string;
    endDate: string;
    staffIds?: number[];
    status?: AppointmentStatus;
  }) {
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
    const [guests, staff, services] = await Promise.all([
      db.guest.findMany({
        where: { isActive: true },
        select: { id: true, name: true, phone: true },
        orderBy: { name: "asc" },
      }),
      db.staff.findMany({
        where: { status: { notIn: ["inactive", "on_leave"] } },
        select: { id: true, name: true, role: true },
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
    ]);
    return {
      guests,
      staff,
      services: services.map((service) => ({
        ...service,
        price: Number(service.price),
        category: service.servicecategory?.name ?? null,
      })),
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
            create: services.map((service: { id: number; price: any; durationMinutes: number }) => ({
              serviceId: service.id,
              staffId: input.staffId,
              priceAtBooking: service.price,
              durationAtBooking: service.durationMinutes,
              status: input.status ?? "pending",
            })),
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
            create: services.map((service: { id: number; price: any; durationMinutes: number }) => ({
              serviceId: service.id,
              staffId: input.staffId,
              priceAtBooking: service.price,
              durationAtBooking: service.durationMinutes,
              status: input.status ?? "pending",
            })),
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

    // Get active staff and their schedules
    const staffList = await db.staff.findMany({
      where: { status: { notIn: ["inactive", "on_leave"] } },
      select: { id: true, name: true, role: true },
    });

    const staffIds = staffList.map((s) => s.id);
    if (params.staffId && staffIds.includes(params.staffId)) {
      // filter to requested staff only
    }

    const effectiveStaffIds = params.staffId
      ? staffIds.filter((id) => id === params.staffId)
      : staffIds;

    // Get staff schedules for the day
    const schedules = await db.staffschedule.findMany({
      where: {
        staffId: { in: effectiveStaffIds },
        date: targetDate,
      },
    });

    const scheduleMap = new Map(
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

        // Check break overlap
        if (
          breakStart !== null &&
          breakEnd !== null &&
          startMin < breakEnd &&
          endMin > breakStart
        ) {
          continue;
        }

        // Check appointment overlap
        const slotStart = new Date(`${params.date}T00:00:00.000Z`);
        slotStart.setMinutes(startMin);
        const slotEnd = new Date(`${params.date}T00:00:00.000Z`);
        slotEnd.setMinutes(endMin);

        const hasConflict = staffAppts.some((appt) => {
          const apptStart = new Date(appt.startTime);
          const apptEnd = new Date(appt.endTime);
          return apptStart < slotEnd && apptEnd > slotStart;
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
