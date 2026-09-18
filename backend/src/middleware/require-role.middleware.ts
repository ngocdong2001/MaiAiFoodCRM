import type { NextFunction, Request, Response } from "express";

import { hasRole, type Role } from "../types/roles.js";

/**
 * Guard that requires the authenticated user to hold at least one of the
 * given roles. Must be registered AFTER authMiddleware so `req.user` is set.
 *
 * Usage:
 *   router.post("/", authMiddleware, requireRole("admin"), handler);
 */
export const requireRole =
  (...required: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const authorized = required.some((role) => hasRole(req.user?.role, role));
    if (!authorized) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    return next();
  };

/** Convenience guard for admin-only (management) endpoints. */
export const requireManagement = requireRole("admin");
