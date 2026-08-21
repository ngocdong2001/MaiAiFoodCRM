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

    const payments = await db.payment.findMany({
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
      include: {
        appointment: {
          include: {
            guest: true,
            appointmentservice: { include: { service: true } },
          },
        },
      },
    });

    let totalRevenue = 0;
    let totalTips = 0;

    const jobs: StaffRevenueDetailJob[] = payments.map((p) => {
      const finalAmt = decimalToNumber(p.finalAmount);
      const tipAmt = decimalToNumber(p.tipAmount);
      totalRevenue += finalAmt;
      totalTips += tipAmt;

      return {
        paymentId: p.id,
        appointmentId: p.appointmentId,
        paidAt: p.paidAt.toISOString(),
        guestName: p.appointment?.guest?.name ?? "Walk-in Guest",
        guestAvatarUrl: p.appointment?.guest?.avatarUrl ?? null,
        services: (p.appointment?.appointmentservice ?? []).map((as) => ({
          serviceId: as.serviceId,
          serviceName: as.service.name,
          price: decimalToNumber(as.priceAtBooking),
        })),
        amount: decimalToNumber(p.amount),
        discountAmount: decimalToNumber(p.discountAmount),
        tipAmount: tipAmt,
        finalAmount: finalAmt,
        paymentMethod: p.paymentMethod,
        receiptNumber: p.receiptNumber ?? null,
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
    const filterWhere: Prisma.paymentWhereInput = {
      ...(filters.staffId ? { staffId: filters.staffId } : {}),
      ...(filters.paymentMethod
        ? { paymentMethod: filters.paymentMethod }
        : {}),
    };

    const latestPayment = await db.payment.findFirst({
      where: filterWhere,
      orderBy: { paidAt: "desc" },
      select: { paidAt: true },
    });

    if (!latestPayment) {
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
        : dayRange(latestPayment.paidAt).start;

    const currentEnd = parsedEndDate
      ? endOfDay(parsedEndDate)
      : parsedStartDate
        ? endOfDay(parsedStartDate)
        : dayRange(latestPayment.paidAt).end;

    const currentRange =
      currentStart.getTime() <= currentEnd.getTime()
        ? { start: currentStart, end: currentEnd }
        : { start: currentEnd, end: currentStart };

    const periodDurationMs =
      currentRange.end.getTime() - currentRange.start.getTime();
    const previousEnd = new Date(currentRange.start.getTime() - 1);
    const previousStart = new Date(previousEnd.getTime() - periodDurationMs);
    const previousRange = { start: previousStart, end: previousEnd };

    const currentWhere: Prisma.paymentWhereInput = {
      ...filterWhere,
      paidAt: {
        gte: currentRange.start,
        lte: currentRange.end,
      },
    };

    const previousWhere: Prisma.paymentWhereInput = {
      ...filterWhere,
      paidAt: {
        gte: previousRange.start,
        lte: previousRange.end,
      },
    };

    const [currentAggregate, previousAggregate, currentPayments] =
      await Promise.all([
        db.payment.aggregate({
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
        db.payment.aggregate({
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
        db.payment.findMany({
          where: currentWhere,
          orderBy: {
            paidAt: "desc",
          },
          include: {
            staff: true,
            appointment: {
              include: {
                guest: true,
                appointmentservice: { include: { service: true } },
              },
            },
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

    currentPayments.forEach((payment) => {
      if (payment.staffId && payment.staff) {
        const existing = staffMap.get(payment.staffId) ?? {
          key: String(payment.staffId),
          staffName: payment.staff.name,
          services: 0,
          tips: 0,
          totalRevenue: 0,
          avatarUrl: payment.staff.avatarUrl ?? null,
          recentServiceNames: [],
        };

        existing.services += 1;
        existing.tips += decimalToNumber(payment.tipAmount);
        existing.totalRevenue += decimalToNumber(payment.finalAmount);
        staffMap.set(payment.staffId, existing);

        const serviceNames =
          staffServiceNamesMap.get(payment.staffId) ?? new Set<string>();
        (payment.appointment?.appointmentservice ?? []).forEach((as) => {
          serviceNames.add(as.service.name);
        });
        staffServiceNamesMap.set(payment.staffId, serviceNames);
      }

      const methodKey = payment.paymentMethod;
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

      methodExisting.amount += decimalToNumber(payment.finalAmount);
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

    const recentRevenueActivities: RevenueActivity[] = currentPayments
      .slice(0, 6)
      .map((payment) => {
        const methodLabel =
          settingMap.get(`${PAYMENT_LABEL_PREFIX}${payment.paymentMethod}`) ??
          buildReadableMethodLabel(payment.paymentMethod);
        const paymentViaPrefix =
          settingMap.get(PAYMENT_VIA_PREFIX_KEY) ?? DEFAULT_PAYMENT_VIA_PREFIX;
        const walkInGuestLabel =
          settingMap.get(WALK_IN_GUEST_KEY) ?? DEFAULT_WALK_IN_GUEST_LABEL;
        const isWalkIn = !payment.appointment?.guest?.name;

        const serviceTags = (payment.appointment?.appointmentservice ?? []).map(
          (as) => as.service.name,
        );

        return {
          key: `${payment.id}`,
          title: payment.appointment?.guest?.name ?? walkInGuestLabel,
          subtitle: `${paymentViaPrefix} ${methodLabel}`,
          paymentMethod: payment.paymentMethod,
          amount: decimalToNumber(payment.finalAmount),
          time: payment.paidAt.toISOString(),
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
};
