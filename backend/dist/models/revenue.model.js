"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueModel = void 0;
const prisma_1 = require("../lib/prisma");
const PAYMENT_METHOD_META = {
    cash: { label: "Cash", color: "#F04CAC" },
    transfer: { label: "Bank Transfer", color: "#00CBC3" },
    card: { label: "Card (POS)", color: "#EEBC4A" },
    ewallet: { label: "E-Wallet", color: "#4F8BFF" },
    loyalty_points: { label: "Loyalty Points", color: "#8A4CE0" },
};
const STAFF_AVATARS = [
    "https://cdn.visily.ai/text2design/agentic-codegen-output/images/1df13a07-bfae-4161-910e-1ba02692b49d.webp",
    "https://cdn.visily.ai/text2design/agentic-codegen-output/images/05700ff1-710c-4e58-9ac7-ff8fa30660bb.webp",
    "https://cdn.visily.ai/text2design/agentic-codegen-output/images/c10d42d4-7e9d-4424-9db1-aa83ead76e6c.webp",
    "https://cdn.visily.ai/text2design/images/54d091efb71e3f93785bead0499f4c3709adf57976e7c7a675afd645b13fa98d.webp",
    "https://cdn.visily.ai/text2design/images/2849a8c214643b5939440013ebcf351c6a210a4a47359e804b5f49bd5774f409.webp",
];
const decimalToNumber = (value) => {
    if (value === null || value === undefined) {
        return 0;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};
const computeDeltaPercent = (current, previous) => {
    if (previous <= 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};
const dayRange = (date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};
const parseDateInput = (input) => {
    if (!input) {
        return undefined;
    }
    const parsed = new Date(input);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};
const startOfDay = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};
const endOfDay = (date) => {
    const normalized = new Date(date);
    normalized.setHours(23, 59, 59, 999);
    return normalized;
};
exports.RevenueModel = {
    async getSummary(filters = {}) {
        const filterWhere = {
            ...(filters.staffId ? { staffId: filters.staffId } : {}),
            ...(filters.paymentMethod
                ? { paymentMethod: filters.paymentMethod }
                : {}),
        };
        const latestPayment = await prisma_1.prisma.payment.findFirst({
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
        const currentRange = currentStart.getTime() <= currentEnd.getTime()
            ? { start: currentStart, end: currentEnd }
            : { start: currentEnd, end: currentStart };
        const periodDurationMs = currentRange.end.getTime() - currentRange.start.getTime();
        const previousEnd = new Date(currentRange.start.getTime() - 1);
        const previousStart = new Date(previousEnd.getTime() - periodDurationMs);
        const previousRange = { start: previousStart, end: previousEnd };
        const currentWhere = {
            ...filterWhere,
            paidAt: {
                gte: currentRange.start,
                lte: currentRange.end,
            },
        };
        const previousWhere = {
            ...filterWhere,
            paidAt: {
                gte: previousRange.start,
                lte: previousRange.end,
            },
        };
        const [currentAggregate, previousAggregate, currentPayments] = await Promise.all([
            prisma_1.prisma.payment.aggregate({
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
            prisma_1.prisma.payment.aggregate({
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
            prisma_1.prisma.payment.findMany({
                where: currentWhere,
                orderBy: {
                    paidAt: "desc",
                },
                include: {
                    staff: true,
                    appointment: {
                        include: {
                            guest: true,
                        },
                    },
                },
            }),
        ]);
        const totalRevenue = decimalToNumber(currentAggregate._sum.finalAmount);
        const serviceRevenue = decimalToNumber(currentAggregate._sum.amount);
        const productRevenue = decimalToNumber(currentAggregate._sum.tipAmount);
        const totalOrders = currentAggregate._count.id;
        const prevTotalRevenue = decimalToNumber(previousAggregate._sum.finalAmount);
        const prevServiceRevenue = decimalToNumber(previousAggregate._sum.amount);
        const prevProductRevenue = decimalToNumber(previousAggregate._sum.tipAmount);
        const prevTotalOrders = previousAggregate._count.id;
        const metrics = [
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
        const staffMap = new Map();
        const paymentMethodMap = new Map();
        currentPayments.forEach((payment) => {
            if (payment.staffId && payment.staff) {
                const existing = staffMap.get(payment.staffId) ?? {
                    key: String(payment.staffId),
                    staffName: payment.staff.name,
                    services: 0,
                    tips: 0,
                    totalRevenue: 0,
                    avatarUrl: payment.staff.avatarUrl ??
                        STAFF_AVATARS[payment.staffId % STAFF_AVATARS.length] ??
                        STAFF_AVATARS[0] ??
                        "",
                };
                existing.services += 1;
                existing.tips += decimalToNumber(payment.tipAmount);
                existing.totalRevenue += decimalToNumber(payment.finalAmount);
                staffMap.set(payment.staffId, existing);
            }
            const methodKey = payment.paymentMethod;
            const methodMeta = PAYMENT_METHOD_META[methodKey] ??
                { label: methodKey.replace(/_/g, " "), color: "#9DA1A7" };
            const methodExisting = paymentMethodMap.get(methodKey) ?? {
                key: methodKey,
                label: methodMeta.label,
                amount: 0,
                color: methodMeta.color,
            };
            methodExisting.amount += decimalToNumber(payment.finalAmount);
            paymentMethodMap.set(methodKey, methodExisting);
        });
        const staffRevenueRows = Array.from(staffMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
        const paymentMethods = Array.from(paymentMethodMap.values()).sort((a, b) => b.amount - a.amount);
        const recentRevenueActivities = currentPayments
            .slice(0, 6)
            .map((payment) => {
            const methodMeta = PAYMENT_METHOD_META[payment.paymentMethod] ??
                { label: payment.paymentMethod.replace(/_/g, " ") };
            return {
                key: `${payment.id}`,
                title: payment.appointment?.guest?.name ?? "Walk-in Guest",
                subtitle: `Payment via ${methodMeta.label}`,
                paymentMethod: payment.paymentMethod,
                amount: decimalToNumber(payment.finalAmount),
                time: payment.paidAt.toISOString(),
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
