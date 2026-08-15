import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { getPrismaMaster } from "../lib/prisma-master.js";
import { getPrismaTenant } from "../lib/prisma-tenant.js";
import type { JwtPayload } from "../types/tenant.js";

const jwtSecret = process.env.JWT_SECRET;

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token || !jwtSecret) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as unknown as JwtPayload;
    const userId = Number(payload.sub);
    const tenantId = Number(payload.tenantId);

    if (!Number.isInteger(userId) || !Number.isInteger(tenantId)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const prismaMaster = getPrismaMaster();

    // Get user and tenant info from master database
    const user = await prismaMaster.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user || !user.isActive || !user.tenant?.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify tenantId from JWT matches user's tenant
    if (user.tenantId !== tenantId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Cross-validate X-Tenant-ID header (if present) against JWT tenant
    const headerTenantSlug = req.headers["x-tenant-id"] as string | undefined;
    if (headerTenantSlug && headerTenantSlug !== user.tenant.slug) {
      return res.status(403).json({ message: "Tenant mismatch" });
    }

    // Set tenant context — resolve DB host/port from environment
    const masterUrl = new URL(process.env.DATABASE_URL_MASTER || "mysql://maiai:maiai@localhost:3306/maiai_master");
    const tenantDbUrl = `mysql://${masterUrl.username}:${masterUrl.password}@${masterUrl.hostname}:${masterUrl.port || 3306}/${user.tenant.databaseName}`;

    req.tenant = {
      id: user.tenant.id,
      name: user.tenant.name,
      databaseUrl: tenantDbUrl,
    };

    // Create tenant-specific Prisma client
    req.tenantClient = getPrismaTenant(
      user.tenant.id,
      req.tenant.databaseUrl,
    );

    // Attach user info
    req.user = {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    };

    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
