import { Prisma } from "../generated/prisma-tenant/client.js";
import type { PrismaClient } from "../generated/prisma-tenant/client.js";

type RevenueMetric = {
  key:
    | "total-daily-revenue"
    | "service-revenue"
    | "product-revenue"
    | "total-orders";
  label: string;
  value: number;
  deltaPercent: number;
  trend: "up" | "down";
};

type StaffRevenueRow = {
  key: string;
  staffName: string;
  services: number;
  tips: number;
  totalRevenue: number;
  avatarUrl: string | null;
  recentServiceNames: string[];
};

type PaymentMethodItem = {
  key: string;
  label: string;
  amount: number;
  color: string;
};

type RevenueActivity = {
  key: string;
  title: string;
  subtitle: string;
  paymentMethod: string;
  amount: number;
  time: string;
  isWalkIn: boolean;
  serviceTags: string[];
  serviceCount: number;
};

export type RevenueSummaryResponse = {
  summaryDate: string;
  metrics: RevenueMetric[];
  staffRevenueRows: StaffRevenueRow[];
  paymentMethods: PaymentMethodItem[];
  recentRevenueActivities: RevenueActivity[];
};

export type RevenueSummaryFilters = {
  startDate?: string;
  endDate?: string;
  staffId?: number;
  paymentMethod?: string;
};

const SETTING_GROUP = "revenue";
const PAYMENT_LABEL_PREFIX = "payment_method_label.";
const PAYMENT_COLOR_PREFIX = "payment_method_color.";
const PAYMENT_VIA_PREFIX_KEY = "activity.payment_via_prefix";
const WALK_IN_GUEST_KEY = "activity.walk_in_guest";
const DEFAULT_PAYMENT_VIA_PREFIX = "Payment via";
const DEFAULT_WALK_IN_GUEST_LABEL = "Walk-in Guest";
const DEFAULT_PAYMENT_COLOR = "#9DA1A7";

const decimalToNumber = (value: unknown): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const computeDeltaPercent = (current: number, previous: number): number => {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
};

const dayRange = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const parseDateInput = (input?: string): Date | undefined => {
  if (!input) {
    return undefined;
  }

  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const startOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const endOfDay = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
};

const buildReadableMethodLabel = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export type StaffRevenueDetailJob = {
  paymentId: number;
  appointmentId: number;
  paidAt: string;
  guestName: string;
  guestAvatarUrl: string | null;
  services: { serviceId: number; serviceName: string; price: number }[];
  amount: number;
  discountAmount: number;
  tipAmount: number;
  finalAmount: number;
  paymentMethod: string;
  receiptNumber: string | null;
  status: string;
  cancelReason: string | null;
  cancelReasonStatus: string | null;
};

export type StaffRevenueDetailResponse = {
  staffId: number;
  staffName: string;
  staffRole: string | null;
  staffAvatarUrl: string | null;
  totalRevenue: number;
  totalTips: number;
  totalJobs: number;
  jobs: StaffRevenueDetailJob[];
};

export const RevenueModel = {
  async getStaffDetail(
    db: PrismaClient,
    staffId: number,
    filters: Pick<RevenueSummaryFilters, "startDate" | "endDate"> = {},
  ): Promise<StaffRevenueDetailResponse | null> {
    const staff = await db.staff.findUnique({ where: { id: staffId } });
    if (!staff) return null;

    const parsedStart = parseDateInput(filters.startDate);
    const parsedEnd = parseDateInput(filters.endDate);

    const records = await db.revenuerecord.findMany({
      where: {
        staffId,
        ...(parsedStart || parsedEnd
          ? {
              paidAt: {
                ...(parsedStart ? { gte: startOfDay(parsedStart) } : {}),
                ...(parsedEnd ? { lte: endOfDay(parsedEnd) } : {}),
              },
            }
          : {}),
      },
      orderBy: { paidAt: "desc" },
      include: { revenuerecorddetail: true },
    });

    let totalRevenue = 0;
    let totalTips = 0;

    const jobs: StaffRevenueDetailJob[] = records.map((r) => {
      const finalAmt = decimalToNumber(r.finalAmount);
      const tipAmt = decimalToNumber(r.tipAmount);
      // Only count non-cancelled records towards totals
      if (r.status !== "cancelled") {
        totalRevenue += finalAmt;
        totalTips += tipAmt;
      }

      return {
        paymentId: r.paymentId,
        appointmentId: r.appointmentId,
        paidAt: r.paidAt.toISOString(),
        guestName: r.guestName,
        guestAvatarUrl: r.guestAvatarUrl ?? null,
        services: r.revenuerecorddetail.map((detail) => ({
          serviceId: detail.serviceId,
          serviceName: detail.serviceName,
          price: decimalToNumber(detail.price),
        })),
        amount: decimalToNumber(r.amount),
        discountAmount: decimalToNumber(r.discountAmount),
        tipAmount: tipAmt,
        finalAmount: finalAmt,
        paymentMethod: r.paymentMethod,
        receiptNumber: r.receiptNumber ?? null,
        status: r.status ?? "completed",
        cancelReason: r.cancelReason ?? null,
        cancelReasonStatus: r.cancelReasonStatus ?? null,
      };
    });

    return {
      staffId: staff.id,
      staffName: staff.name,
      staffRole: staff.role ?? null,
      staffAvatarUrl: staff.avatarUrl ?? null,
      totalRevenue,
      totalTips,
      totalJobs: jobs.length,
      jobs,
    };
  },

  async getSummary(
    db: PrismaClient,
    filters: RevenueSummaryFilters = {},
  ): Promise<RevenueSummaryResponse> {
    const filterWhere: Prisma.revenuerecordWhereInput = {
      ...(filters.staffId ? { staffId: filters.staffId } : {}),
      ...(filters.paymentMethod
        ? { paymentMethod: filters.paymentMethod }
        : {}),
    };

    const latestRecord = await db.revenuerecord.findFirst({
      where: filterWhere,
      orderBy: { paidAt: "desc" },
      select: { paidAt: true },
    });

    if (!latestRecord) {
      return {
        summaryDate: new Date().toISOString(),
        metrics: [
          {
            key: "total-daily-revenue",
            label: "Total Daily Revenue",
            value: 0,
            deltaPercent: 0,
            trend: "up",
          },
          {
            key: "service-revenue",
            label: "Service Revenue",
            value: 0,
            deltaPercent: 0,
            trend: "up",
          },
          {
            key: "product-revenue",
            label: "Product Revenue",
            value: 0,
            deltaPercent: 0,
            trend: "up",
          },
          {
            key: "total-orders",
            label: "Total Orders",
            value: 0,
            deltaPercent: 0,
            trend: "up",
          },
        ],
        staffRevenueRows: [],
        paymentMethods: [],
        recentRevenueActivities: [],
      };
    }

    const parsedStartDate = parseDateInput(filters.startDate);
    const parsedEndDate = parseDateInput(filters.endDate);

    const currentStart = parsedStartDate
      ? startOfDay(parsedStartDate)
      : parsedEndDate
        ? startOfDay(parsedEndDate)
        : dayRange(latestRecord.paidAt).start;

    const currentEnd = parsedEndDate
      ? endOfDay(parsedEndDate)
      : parsedStartDate
        ? endOfDay(parsedStartDate)
        : dayRange(latestRecord.paidAt).end;

    const currentRange =
      currentStart.getTime() <= currentEnd.getTime()
        ? { start: currentStart, end: currentEnd }
        : { start: currentEnd, end: currentStart };

    const periodDurationMs =
      currentRange.end.getTime() - currentRange.start.getTime();
    const previousEnd = new Date(currentRange.start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - periodDurationMs);
    const previousRange = { start: previousStart, end: previousEnd };

    const currentWhere: Prisma.revenuerecordWhereInput = {
      ...filterWhere,
      paidAt: {
        gte: currentRange.start,
        lte: currentRange.end,
      },
      // Exclude cancelled records from revenue totals
      status: { not: "cancelled" },
    };

    const previousWhere: Prisma.revenuerecordWhereInput = {
      ...filterWhere,
      paidAt: {
        gte: previousRange.start,
        lte: previousRange.end,
      },
      // Exclude cancelled records from revenue totals
      status: { not: "cancelled" },
    };

    // For the staff row map, we need all records including cancelled ones
    const currentAllWhere: Prisma.revenuerecordWhereInput = {
      ...filterWhere,
      paidAt: {
        gte: currentRange.start,
        lte: currentRange.end,
      },
    };

    const [currentAggregate, previousAggregate, currentRecords, currentAllRecords] =
      await Promise.all([
        db.revenuerecord.aggregate({
          where: currentWhere,
          _sum: {
            finalAmount: true,
            amount: true,
            tipAmount: true,
          },
          _count: {
            id: true,
          },
        }),
        db.revenuerecord.aggregate({
          where: previousWhere,
          _sum: {
            finalAmount: true,
            amount: true,
            tipAmount: true,
          },
          _count: {
            id: true,
          },
        }),
        db.revenuerecord.findMany({
          where: currentWhere,
          orderBy: {
            paidAt: "desc",
          },
          include: {
            revenuerecorddetail: true,
          },
        }),
        db.revenuerecord.findMany({
          where: currentAllWhere,
          orderBy: {
            paidAt: "desc",
          },
          include: {
            revenuerecorddetail: true,
          },
        }),
      ]);

    const settingRows = await db.setting.findMany({
      where: { group: SETTING_GROUP },
      select: { key: true, value: true },
    });
    const settingMap = new Map(settingRows.map((row) => [row.key, row.value]));

    const totalRevenue = decimalToNumber(currentAggregate._sum.finalAmount);
    const serviceRevenue = decimalToNumber(currentAggregate._sum.amount);
    const productRevenue = decimalToNumber(currentAggregate._sum.tipAmount);
    const totalOrders = currentAggregate._count.id;

    const prevTotalRevenue = decimalToNumber(
      previousAggregate._sum.finalAmount,
    );
    const prevServiceRevenue = decimalToNumber(previousAggregate._sum.amount);
    const prevProductRevenue = decimalToNumber(
      previousAggregate._sum.tipAmount,
    );
    const prevTotalOrders = previousAggregate._count.id;

    const metrics: RevenueMetric[] = [
      {
        key: "total-daily-revenue",
        label: "Total Daily Revenue",
        value: totalRevenue,
        deltaPercent: computeDeltaPercent(totalRevenue, prevTotalRevenue),
        trend: totalRevenue >= prevTotalRevenue ? "up" : "down",
      },
      {
        key: "service-revenue",
        label: "Service Revenue",
        value: serviceRevenue,
        deltaPercent: computeDeltaPercent(serviceRevenue, prevServiceRevenue),
        trend: serviceRevenue >= prevServiceRevenue ? "up" : "down",
      },
      {
        key: "product-revenue",
        label: "Product Revenue",
        value: productRevenue,
        deltaPercent: computeDeltaPercent(productRevenue, prevProductRevenue),
        trend: productRevenue >= prevProductRevenue ? "up" : "down",
      },
      {
        key: "total-orders",
        label: "Total Orders",
        value: totalOrders,
        deltaPercent: computeDeltaPercent(totalOrders, prevTotalOrders),
        trend: totalOrders >= prevTotalOrders ? "up" : "down",
      },
    ];

    const staffMap = new Map<number, StaffRevenueRow>();
    const paymentMethodMap = new Map<string, PaymentMethodItem>();

    const staffServiceNamesMap = new Map<number, Set<string>>();

    // Use currentAllRecords for staff map so cancelled bookings appear in the list
    currentAllRecords.forEach((record) => {
      if (record.staffId) {
        const existing = staffMap.get(record.staffId) ?? {
          key: String(record.staffId),
          staffName: record.staffName ?? "Unknown Staff",
          services: 0,
          tips: 0,
          totalRevenue: 0,
          avatarUrl: record.staffAvatarUrl ?? null,
          recentServiceNames: [],
        };

        existing.services += 1;
        existing.tips += decimalToNumber(record.tipAmount);
        existing.totalRevenue += decimalToNumber(record.finalAmount);
        staffMap.set(record.staffId, existing);

        const serviceNames =
          staffServiceNamesMap.get(record.staffId) ?? new Set<string>();
        record.revenuerecorddetail.forEach((detail) => {
          serviceNames.add(detail.serviceName);
        });
        staffServiceNamesMap.set(record.staffId, serviceNames);
      }

      const methodKey = record.paymentMethod;
      const methodLabel =
        settingMap.get(`${PAYMENT_LABEL_PREFIX}${methodKey}`) ??
        buildReadableMethodLabel(methodKey);
      const methodColor =
        settingMap.get(`${PAYMENT_COLOR_PREFIX}${methodKey}`) ??
        DEFAULT_PAYMENT_COLOR;
      const methodExisting = paymentMethodMap.get(methodKey) ?? {
        key: methodKey,
        label: methodLabel,
        amount: 0,
        color: methodColor,
      };

      methodExisting.amount += decimalToNumber(record.finalAmount);
      paymentMethodMap.set(methodKey, methodExisting);
    });

    staffServiceNamesMap.forEach((names, staffId) => {
      const row = staffMap.get(staffId);
      if (row) {
        row.recentServiceNames = Array.from(names).slice(0, 2);
      }
    });

    const staffRevenueRows = Array.from(staffMap.values()).sort(
      (a, b) => b.totalRevenue - a.totalRevenue,
    );

    const paymentMethods = Array.from(paymentMethodMap.values()).sort(
      (a, b) => b.amount - a.amount,
    );

    const recentRevenueActivities: RevenueActivity[] = currentRecords
      .slice(0, 6)
      .map((record) => {
        const methodLabel =
          settingMap.get(`${PAYMENT_LABEL_PREFIX}${record.paymentMethod}`) ??
          buildReadableMethodLabel(record.paymentMethod);
        const paymentViaPrefix =
          settingMap.get(PAYMENT_VIA_PREFIX_KEY) ?? DEFAULT_PAYMENT_VIA_PREFIX;
        const walkInGuestLabel =
          settingMap.get(WALK_IN_GUEST_KEY) ?? DEFAULT_WALK_IN_GUEST_LABEL;
        const isWalkIn = !record.guestName;

        const serviceTags = record.revenuerecorddetail.map(
          (detail) => detail.serviceName,
        );

        return {
          key: `${record.paymentId}`,
          title: record.guestName || walkInGuestLabel,
          subtitle: `${paymentViaPrefix} ${methodLabel}`,
          paymentMethod: record.paymentMethod,
          amount: decimalToNumber(record.finalAmount),
          time: record.paidAt.toISOString(),
          isWalkIn,
          serviceTags,
          serviceCount: serviceTags.length,
        };
      });

    return {
      summaryDate: currentRange.end.toISOString(),
      metrics,
      staffRevenueRows,
      paymentMethods,
      recentRevenueActivities,
    };
  },

  async updateCancelReason(
    db: PrismaClient,
    recordId: number,
    cancelReason: string,
  ) {
    const record = await db.revenuerecord.findUnique({
      where: { paymentId: recordId },
      select: { id: true, status: true },
    });
    if (!record || record.status !== "cancelled") return null;

    const updated = await db.revenuerecord.update({
      where: { id: record.id },
      data: {
        cancelReason,
        cancelReasonStatus: "pending",
      },
    });
    return {
      id: updated.id,
      cancelReason: updated.cancelReason,
      cancelReasonStatus: updated.cancelReasonStatus,
    };
  },

  async restoreBooking(
    db: PrismaClient,
    recordId: number,
  ) {
    const record = await db.revenuerecord.findUnique({
      where: { paymentId: recordId },
      select: { id: true, status: true, appointmentId: true, paymentId: true },
    });
    if (!record || record.status !== "cancelled") return null;

    await db.$transaction(async (tx) => {
      // 1. Delete the cancelled revenue record
      await tx.revenuerecord.delete({ where: { id: record.id } });

      // 2. Restore the appointment to "pending"
      await tx.appointment.update({
        where: { id: record.appointmentId },
        data: {
          status: "pending",
          cancelReason: null,
          updatedAt: new Date(),
          appointmentservice: {
            updateMany: { where: {}, data: { status: "pending" } },
          },
        },
      });

      // 3. Delete the zero-amount payment that was auto-created on cancel
      const payment = await tx.payment.findUnique({
        where: { id: record.paymentId },
        select: { amount: true, paymentStatus: true },
      });
      if (payment && Number(payment.amount) === 0 && payment.paymentStatus === "cancelled") {
        // Delete payment details first (cascade should handle, but be explicit)
        await tx.paymentdetail.deleteMany({ where: { paymentId: record.paymentId } });
        await tx.payment.delete({ where: { id: record.paymentId } });
      }
    });

    return { success: true, appointmentId: record.appointmentId };
  },
};
