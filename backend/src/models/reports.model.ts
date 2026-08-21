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

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
      ? new Date(filters.endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0); // end of current month

    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(now.getFullYear(), now.getMonth() - 5, 1); // 6 months ago start

    // Previous period of same length for delta comparison
    const periodMs = endDate.getTime() - startDate.getTime();
    const prevEnd = new Date(startDate.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - periodMs);

    const [currentPayments, previousPayments, appointments, appointmentServices] =
      await Promise.all([
        db.payment.findMany({
          where: {
            paidAt: { gte: startDate, lte: endDate },
            paymentStatus: "paid",
          },
          select: { finalAmount: true, paidAt: true },
        }),
        db.payment.findMany({
          where: {
            paidAt: { gte: prevStart, lte: prevEnd },
            paymentStatus: "paid",
          },
          select: { finalAmount: true },
        }),
        db.appointment.findMany({
          where: {
            startTime: { gte: startDate, lte: endDate },
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
            },
          },
          select: {
            service: { select: { name: true } },
          },
        }),
      ]);

    // ── Metrics ──────────────────────────────────────────────────────────────
    const totalRevenue = currentPayments.reduce(
      (s, p) => s + toNum(p.finalAmount),
      0,
    );
    const prevRevenue = previousPayments.reduce(
      (s, p) => s + toNum(p.finalAmount),
      0,
    );
    const revDelta = deltaPct(totalRevenue, prevRevenue);

    const totalBookings = appointments.length;
    // previous period bookings count
    const prevBookingsCount = await db.appointment.count({
      where: { startTime: { gte: prevStart, lte: prevEnd } },
    });
    const bookingsDelta = deltaPct(totalBookings, prevBookingsCount);

    const avgTicket =
      currentPayments.length > 0 ? totalRevenue / currentPayments.length : 0;
    const prevAvgTicket =
      previousPayments.length > 0 ? prevRevenue / previousPayments.length : 0;
    const avgDelta = deltaPct(avgTicket, prevAvgTicket);

    // Seat utilization: completed appointments / total appointments in period
    const completedCount = appointments.filter(
      (a) => a.status === "completed",
    ).length;
    const utilization = totalBookings > 0 ? (completedCount / totalBookings) * 100 : 0;

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

    for (const p of currentPayments) {
      if (!p.paidAt) continue;
      const d = new Date(p.paidAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthlyMap.get(key);
      if (entry) entry.current += toNum(p.finalAmount);
    }

    // Fetch previous period payments for monthly comparison
    const prevPeriodPayments = await db.payment.findMany({
      where: {
        paidAt: {
          gte: new Date(startDate.getFullYear() - 1, startDate.getMonth(), 1),
          lte: new Date(endDate.getFullYear() - 1, endDate.getMonth() + 1, 0),
        },
        paymentStatus: "paid",
      },
      select: { finalAmount: true, paidAt: true },
    });

    for (const p of prevPeriodPayments) {
      if (!p.paidAt) continue;
      const d = new Date(p.paidAt);
      // shift by 1 year forward to align with current period months
      const key = `${d.getFullYear() + 1}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = monthlyMap.get(key);
      if (entry) entry.previous += toNum(p.finalAmount);
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
          totalServices > 0
            ? Math.round((count / totalServices) * 100)
            : 0,
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
