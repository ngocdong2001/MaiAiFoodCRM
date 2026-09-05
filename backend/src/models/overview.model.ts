import type { PrismaClient } from "../generated/prisma-tenant/client.js";

export type OverviewStats = {
  upcomingBookings: number;
  newBookingsToday: number;
  activePending: number;
  recentCheckIns: number;
  completedToday: number;
  todayRevenue: number;
};

export type QueueItem = {
  id: number;
  guestName: string;
  serviceName: string;
  startTime: string;
  notes: string | null;
  status: string;
  urgent: boolean;
};

export type SnapshotItem = {
  id: number;
  time: string;
  title: string;
  staffName: string;
  status: string;
};

export type RecentGuestItem = {
  id: number;
  name: string;
  lastVisitAt: string;
};

export type StaffOnDutyItem = {
  id: number;
  name: string;
  role: string;
  avatarUrl: string | null;
  status: string;
  appointmentCountToday: number;
};

export type OverviewData = {
  stats: OverviewStats;
  liveQueue: QueueItem[];
  todaysSnapshot: SnapshotItem[];
  recentGuests: RecentGuestItem[];
  staffOnDuty: StaffOnDutyItem[];
};

const todayRange = () => {
  const now = new Date();
  const isoDate = now.toISOString().slice(0, 10);
  const start = new Date(`${isoDate}T00:00:00.000Z`);
  const end = new Date(`${isoDate}T23:59:59.999Z`);
  return { start, end };
};

const fmt12h = (date: Date) =>
  date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export const OverviewModel = {
  async get(prisma: PrismaClient): Promise<OverviewData> {
    const { start, end } = todayRange();
    const now = new Date();
    const urgentThreshold = new Date(now.getTime() + 15 * 60 * 1000);
    const todayDate = new Date(start); // midnight UTC-normalized for staffschedule date match

    const [
      upcomingBookings,
      newBookingsToday,
      activePending,
      recentCheckIns,
      completedToday,
      revenueRows,
      queueRows,
      snapshotRows,
      recentGuestRows,
      staffScheduleRows,
    ] = await Promise.all([
      prisma.appointment.count({
        where: {
          startTime: { gte: start },
          status: { notIn: ["cancelled", "no_show"] },
        },
      }),
      prisma.appointment.count({
        where: { createdAt: { gte: start, lte: end } },
      }),
      prisma.appointment.count({
        where: {
          startTime: { gte: start, lte: end },
          status: { in: ["pending", "confirmed"] },
        },
      }),
      prisma.appointment.count({
        where: {
          startTime: { gte: start, lte: end },
          status: { in: ["in_progress", "confirmed"] },
        },
      }),
      prisma.appointment.count({
        where: { startTime: { gte: start, lte: end }, status: "completed" },
      }),
      // Today's total revenue (sum of finalAmount for payments paid today)
      prisma.payment.aggregate({
        where: { paidAt: { gte: start, lte: end }, paymentStatus: "paid" },
        _sum: { finalAmount: true },
      }),
      // Live queue: today's not-yet-completed bookings
      prisma.appointment.findMany({
        where: {
          startTime: { gte: start, lte: end },
          status: { in: ["pending", "confirmed", "in_progress"] },
        },
        orderBy: { startTime: "asc" },
        select: {
          id: true,
          startTime: true,
          notes: true,
          status: true,
          guest: { select: { name: true } },
          appointmentservice: {
            take: 1,
            select: { service: { select: { name: true } } },
          },
        },
      }),
      // Today's full snapshot
      prisma.appointment.findMany({
        where: { startTime: { gte: start, lte: end } },
        orderBy: { startTime: "asc" },
        select: {
          id: true,
          startTime: true,
          status: true,
          guest: { select: { name: true } },
          staff: { select: { name: true } },
          appointmentservice: {
            take: 1,
            select: { service: { select: { name: true } } },
          },
        },
      }),
      // Recent guests — only actual past visits, never future/confirmed bookings
      prisma.appointment.findMany({
        where: {
          status: { in: ["completed", "confirmed", "in_progress"] },
          startTime: { lte: now },
        },
        orderBy: { startTime: "desc" },
        take: 20,
        distinct: ["guestId"],
        select: {
          startTime: true,
          guest: { select: { id: true, name: true } },
        },
      }),
      // Staff on duty today — match staffschedule.date (stored as UTC midnight DATE)
      prisma.staffschedule.findMany({
        where: {
          date: new Date(
            new Date().toISOString().slice(0, 10) + "T00:00:00.000Z",
          ),
          isDayOff: false,
        },
        select: {
          staff: {
            select: {
              id: true,
              name: true,
              role: true,
              avatarUrl: true,
              status: true,
              appointment: {
                where: {
                  startTime: { gte: start, lte: end },
                  status: { notIn: ["cancelled", "no_show"] },
                },
                select: { id: true },
              },
            },
          },
        },
      }),
    ]);

    const todayRevenue = Number(revenueRows._sum.finalAmount ?? 0);

    const liveQueue: QueueItem[] = queueRows.map((row) => ({
      id: row.id,
      guestName: row.guest?.name ?? "Walk-in Guest",
      serviceName: row.appointmentservice[0]?.service.name ?? "—",
      startTime: row.startTime.toISOString(),
      notes: row.notes,
      status: row.status,
      urgent: row.startTime <= urgentThreshold,
    }));

    const todaysSnapshot: SnapshotItem[] = snapshotRows.map((row) => ({
      id: row.id,
      time: fmt12h(row.startTime),
      title: `${row.appointmentservice[0]?.service.name ?? "Appointment"} with ${row.staff.name}`,
      staffName: row.staff.name,
      status: row.status,
    }));

    const recentGuests: RecentGuestItem[] = recentGuestRows
      .filter((row) => row.guest?.name)
      .slice(0, 6)
      .map((row) => ({
        id: row.guest.id,
        name: row.guest.name ?? "Walk-in Guest",
        lastVisitAt: row.startTime.toISOString(),
      }));

    const staffOnDuty: StaffOnDutyItem[] = staffScheduleRows.map((row) => ({
      id: row.staff.id,
      name: row.staff.name,
      role: row.staff.role,
      avatarUrl: row.staff.avatarUrl,
      status: row.staff.status,
      appointmentCountToday: row.staff.appointment.length,
    }));

    return {
      stats: {
        upcomingBookings,
        newBookingsToday,
        activePending,
        recentCheckIns,
        completedToday,
        todayRevenue,
      },
      liveQueue,
      todaysSnapshot,
      recentGuests,
      staffOnDuty,
    };
  },
};
