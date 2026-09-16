import type { PrismaClient } from "../generated/prisma-tenant/client.js";

export type ReportStatMetric = {
  key: string;
  label: string;
  value: string;
  rawValue: number;
  change: string;
  trend: "up" | "down" | "neutral";
};

export type MonthlyRevenuePoint = {
  month: string;
  current: number;
  previous: number;
};

export type ServiceBreakdownPoint = {
  name: string;
  value: number; // percentage
  count: number;
};

export type DailyUtilizationPoint = {
  day: string;
  utilization: number; // percentage
};

export type ReportsSummaryResponse = {
  metrics: ReportStatMetric[];
  monthlyRevenue: MonthlyRevenuePoint[];
  serviceBreakdown: ServiceBreakdownPoint[];
  weeklyUtilization: DailyUtilizationPoint[];
};

export type ReportsSummaryFilters = {
  startDate?: string;
  endDate?: string;
};

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(v);

const deltaPct = (curr: number, prev: number): number => {
  if (prev <= 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev) * 100;
};

const fmtChange = (pct: number): string => {
  const abs = Math.abs(pct).toFixed(1);
  return pct >= 0 ? `+${abs}%` : `-${abs}%`;
};

export const ReportsModel = {
  async getSummary(
    db: PrismaClient,
    filters: ReportsSummaryFilters = {},
  ): Promise<ReportsSummaryResponse> {
    const now = new Date();

    // Determine the period window — default to last 6 months
    const endDate = filters.endDate
      ? new Date(`${filters.endDate}T00:00:00`)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0); // end of current month
    // Date-only strings (e.g. from a date input) default to midnight, which
    // would exclude the entire day — extend to the last millisecond of the day.
    endDate.setHours(23, 59, 59, 999);

    const startDate = filters.startDate
      ? new Date(`${filters.startDate}T00:00:00`)
      : new Date(now.getFullYear(), now.getMonth() - 5, 1); // 6 months ago start
    startDate.setHours(0, 0, 0, 0);

    // Previous period of same length for delta comparison
    const periodMs = endDate.getTime() - startDate.getTime();
    const prevEnd = new Date(startDate.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - periodMs);

    const [
      currentRevenueRecords,
      previousRevenueRecords,
      appointments,
      appointmentServices,
    ] = await Promise.all([
      // Revenue totals must match the Revenue page: read from the immutable
      // revenuerecord snapshot (excludes cancelled bookings) instead of the
      // live payment table, which can drift from actual booking outcomes.
      db.revenuerecord.findMany({
        where: {
          paidAt: { gte: startDate, lte: endDate },
          status: { not: "cancelled" },
        },
        select: { finalAmount: true, paidAt: true },
      }),
      db.revenuerecord.findMany({
        where: {
          paidAt: { gte: prevStart, lte: prevEnd },
          status: { not: "cancelled" },
        },
        select: { finalAmount: true },
      }),
      db.appointment.findMany({
        where: {
          startTime: { gte: startDate, lte: endDate },
          status: { not: "cancelled" },
        },
        select: {
          id: true,
          startTime: true,
          status: true,
        },
      }),
      db.appointmentservice.findMany({
        where: {
          appointment: {
            startTime: { gte: startDate, lte: endDate },
            status: { not: "cancelled" },
          },
        },
        select: {
          service: { select: { name: true } },
        },
      }),
    ]);

    // ── Metrics ──────────────────────────────────────────────────────────────
    const totalRevenue = currentRevenueRecords.reduce(
      (s, r) => s + toNum(r.finalAmount),
      0,
    );
    const prevRevenue = previousRevenueRecords.reduce(
      (s, r) => s + toNum(r.finalAmount),
      0,
    );
    const revDelta = deltaPct(totalRevenue, prevRevenue);

    const totalBookings = appointments.length;
    // previous period bookings count (excluding cancelled)
    const prevBookingsCount = await db.appointment.count({
      where: {
        startTime: { gte: prevStart, lte: prevEnd },
        status: { not: "cancelled" },
      },
    });
    const bookingsDelta = deltaPct(totalBookings, prevBookingsCount);

    const avgTicket =
      currentRevenueRecords.length > 0
        ? totalRevenue / currentRevenueRecords.length
        : 0;
    const prevAvgTicket =
      previousRevenueRecords.length > 0
        ? prevRevenue / previousRevenueRecords.length
        : 0;
    const avgDelta = deltaPct(avgTicket, prevAvgTicket);

    // Seat utilization: completed appointments / total appointments in period
    const completedCount = appointments.filter(
      (a) => a.status === "completed",
    ).length;
    const utilization =
      totalBookings > 0 ? (completedCount / totalBookings) * 100 : 0;

    const metrics: ReportStatMetric[] = [
      {
        key: "total-revenue",
        label: "Total Revenue",
        value: fmtCurrency(totalRevenue),
        rawValue: totalRevenue,
        change: fmtChange(revDelta),
        trend: revDelta >= 0 ? "up" : "down",
      },
      {
        key: "total-bookings",
        label: "Total Bookings",
        value: totalBookings.toLocaleString("en-US"),
        rawValue: totalBookings,
        change: fmtChange(bookingsDelta),
        trend: bookingsDelta >= 0 ? "up" : "down",
      },
      {
        key: "avg-ticket",
        label: "Avg. Ticket Size",
        value: fmtCurrency(avgTicket),
        rawValue: avgTicket,
        change: fmtChange(avgDelta),
        trend: avgDelta >= 0 ? "up" : "down",
      },
      {
        key: "seat-utilization",
        label: "Seat Utilization",
        value: `${utilization.toFixed(1)}%`,
        rawValue: utilization,
        change: "",
        trend: "neutral",
      },
    ];

    // ── Monthly Revenue ───────────────────────────────────────────────────────
    // Build 6 months ending at endDate
    const monthlyMap = new Map<string, { current: number; previous: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(endDate.getFullYear(), endDate.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, { current: 0, previous: 0 });
    }

    for (const r of currentRevenueRecords) {
      if (!r.paidAt) continue;
      const d = new Date(r.paidAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthlyMap.get(key);
      if (entry) entry.current += toNum(r.finalAmount);
    }

    // Fetch previous-year revenue records for monthly comparison
    const prevPeriodRevenueRecords = await db.revenuerecord.findMany({
      where: {
        paidAt: {
          gte: new Date(startDate.getFullYear() - 1, startDate.getMonth(), 1),
          lte: new Date(endDate.getFullYear() - 1, endDate.getMonth() + 1, 0),
        },
        status: { not: "cancelled" },
      },
      select: { finalAmount: true, paidAt: true },
    });

    for (const r of prevPeriodRevenueRecords) {
      if (!r.paidAt) continue;
      const d = new Date(r.paidAt);
      // shift by 1 year forward to align with current period months
      const key = `${d.getFullYear() + 1}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthlyMap.get(key);
      if (entry) entry.previous += toNum(r.finalAmount);
    }

    const monthlyRevenue: MonthlyRevenuePoint[] = Array.from(
      monthlyMap.entries(),
    ).map(([key, val]) => ({
      month: MONTH_LABELS[Number.parseInt(key.split("-")[1], 10) - 1],
      current: val.current,
      previous: val.previous,
    }));

    // ── Service Breakdown ─────────────────────────────────────────────────────
    const serviceCount = new Map<string, number>();
    for (const as of appointmentServices) {
      const name = as.service?.name ?? "Other";
      serviceCount.set(name, (serviceCount.get(name) ?? 0) + 1);
    }
    const totalServices = appointmentServices.length;
    const serviceBreakdown: ServiceBreakdownPoint[] = Array.from(
      serviceCount.entries(),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({
        name,
        count,
        value:
          totalServices > 0 ? Math.round((count / totalServices) * 100) : 0,
      }));

    // ── Weekly Utilization ────────────────────────────────────────────────────
    // Count appointments per weekday in the period
    const dayBookings = new Array(7).fill(0);
    const dayTotal = new Array(7).fill(0);
    for (const a of appointments) {
      const dow = new Date(a.startTime).getDay();
      dayTotal[dow]++;
      if (a.status === "completed") dayBookings[dow]++;
    }
    const weeklyUtilization: DailyUtilizationPoint[] = DAY_LABELS.map(
      (day, i) => ({
        day,
        utilization:
          dayTotal[i] > 0
            ? Math.round((dayBookings[i] / dayTotal[i]) * 100)
            : 0,
      }),
    );

    return {
      metrics,
      monthlyRevenue,
      serviceBreakdown,
      weeklyUtilization,
    };
  },
};
