import type { Response } from "express";

export type QueueChangeReason =
  | "appointment.created"
  | "appointment.updated"
  | "appointment.status_changed"
  | "appointment.deleted";

type QueueEvent = {
  type: "queue.changed";
  reason: QueueChangeReason;
  appointmentId: number;
  occurredAt: string;
};

const subscribers = new Map<number, Set<Response>>();

const writeEvent = (response: Response, event: QueueEvent) => {
  response.write(`event: ${event.type}\n`);
  response.write(`data: ${JSON.stringify(event)}\n\n`);
};

export const queueEvents = {
  subscribe(tenantId: number, response: Response) {
    const tenantSubscribers = subscribers.get(tenantId) ?? new Set<Response>();
    tenantSubscribers.add(response);
    subscribers.set(tenantId, tenantSubscribers);

    return () => {
      tenantSubscribers.delete(response);
      if (tenantSubscribers.size === 0) subscribers.delete(tenantId);
    };
  },

  publish(tenantId: number, reason: QueueChangeReason, appointmentId: number) {
    const event: QueueEvent = {
      type: "queue.changed",
      reason,
      appointmentId,
      occurredAt: new Date().toISOString(),
    };

    subscribers
      .get(tenantId)
      ?.forEach((response) => writeEvent(response, event));
  },
};
