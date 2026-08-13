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
    const payload = jwt.verify(token, jwtSecret) as JwtPayload;
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

    // Set tenant context
    req.tenant = {
      id: user.tenant.id,
      name: user.tenant.name,
      databaseUrl: `mysql://maiai:123@127.0.0.1:3306/${user.tenant.databaseName}`,
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
