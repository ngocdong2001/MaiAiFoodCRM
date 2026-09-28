import type { PrismaClient } from "../generated/prisma-tenant/client.js";

export type BookingNotificationInput = {
  appointmentId: number;
  guestName: string;
  staffName: string;
  serviceNames: string[];
  startTime: Date | string;
};

export const NotificationModel = {
  create(prisma: PrismaClient, input: BookingNotificationInput) {
    return prisma.notification.create({
      data: {
        ...input,
        startTime: new Date(input.startTime),
      },
    });
  },

  list(prisma: PrismaClient) {
    return prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  },

  markAllRead(prisma: PrismaClient) {
    return prisma.notification.updateMany({
      where: { readAt: null },
      data: { readAt: new Date() },
    });
  },
};