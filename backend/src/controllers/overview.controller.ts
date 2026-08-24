import type { Request, Response } from "express";
import { queueEvents } from "../lib/queue-events.js";
import { OverviewModel } from "../models/overview.model.js";

export const OverviewController = {
  streamQueue(req: Request, res: Response): void {
    if (!req.tenant) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    res.status(200);
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.flushHeaders();
    res.write("retry: 3000\n\n");

    const unsubscribe = queueEvents.subscribe(req.tenant.id, res);
    const heartbeat = setInterval(() => res.write(": ping\n\n"), 25_000);

    req.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  },

  async get(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenantClient) {
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }
      const data = await OverviewModel.get(req.tenantClient);
      res.json({ success: true, data });
    } catch (error) {
      console.error("OverviewController.get error:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to load overview data" });
    }
  },
};
