import type { NextFunction, Request, Response } from "express";

import { resolveActionKey } from "../lib/system-log-actions";

/**
 * Records every mutating request (create/update/delete) as an immutable
 * system log entry, reusing the existing `auditlog` table.
 * Read-only requests (GET/HEAD/OPTIONS) are not logged to keep the table
 * focused on actual actions taken on the system.
 */
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Never log requests to the log listing endpoint itself.
const SKIP_PATH_PREFIXES = ["/api/settings/system-logs"];

const SENSITIVE_BODY_KEYS = ["password", "currentPassword", "newPassword", "token"];

const extractEntityInfo = (path: string) => {
  // e.g. "/api/revenue/record/12/restore" -> segments: ["revenue","record","12","restore"]
  const segments = path.split("/").filter(Boolean).filter((s) => s !== "api");
  const entityType = segments[0] ?? "unknown";
  const numericSegment = segments.find((s) => /^\d+$/.test(s));
  const entityId = numericSegment ? Number.parseInt(numericSegment, 10) : 0;
  return { entityType, entityId };
};

const sanitizeBody = (body: unknown): string | null => {
  if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
    return null;
  }
  const clone: Record<string, unknown> = { ...(body as Record<string, unknown>) };
  for (const key of SENSITIVE_BODY_KEYS) {
    if (key in clone) clone[key] = "[REDACTED]";
  }
  try {
    return JSON.stringify(clone).slice(0, 2000);
  } catch {
    return null;
  }
};

export const activityLoggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!MUTATING_METHODS.has(req.method)) {
    return next();
  }
  if (SKIP_PATH_PREFIXES.some((prefix) => req.originalUrl.startsWith(prefix))) {
    return next();
  }

  const startedAt = Date.now();
  // Capture path/body at request time — Express mutates req.path as it
  // traverses routers, so by the time res.on('finish') fires the value
  // is wrong (e.g. "/7" instead of "/api/staff/7").
  const capturedPath = req.path;
  const capturedOriginalUrl = req.originalUrl;
  const capturedBody = req.body ? { ...req.body } : undefined;

  res.on("finish", () => {
    void recordActivity(req, res, Date.now() - startedAt, capturedPath, capturedOriginalUrl, capturedBody);
  });

  next();
};

async function recordActivity(
  req: Request,
  res: Response,
  durationMs: number,
  capturedPath: string,
  capturedOriginalUrl: string,
  capturedBody: Record<string, unknown> | undefined,
) {
  // No tenant context (e.g. failed auth, or master-only routes) — nothing to attribute this to.
  const db = req.tenantClient;
  if (!db) return;

  const { entityType, entityId } = extractEntityInfo(capturedPath);
  const user = req.user;
  const performedBy = user ? `${user.name} <${user.email}> (${user.role})` : "Unknown";
  const ipAddress =
    (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    null;

  const newValues = JSON.stringify({
    method: req.method,
    path: capturedOriginalUrl,
    statusCode: res.statusCode,
    durationMs,
    userAgent: req.headers["user-agent"] ?? null,
    success: res.statusCode < 400,
  }).slice(0, 2000);

  // Build a temporary req-like object for resolveActionKey since it reads req.path
  const fakeReq = { ...req, path: capturedPath, body: capturedBody } as Request;

  try {
    await db.auditlog.create({
      data: {
        entityType,
        entityId,
        action: resolveActionKey(fakeReq),
        oldValues: sanitizeBody(capturedBody),
        newValues,
        performedBy,
        ipAddress,
      },
    });
  } catch (error) {
    console.error("activityLogger: failed to record system log", error);
  }
}
