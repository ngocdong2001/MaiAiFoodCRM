import { PrismaClient } from "../generated/prisma/client.js";

// This file is kept for backward compatibility.
// Use prisma-master.ts and prisma-tenant.ts for multi-tenant operations.

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient__: PrismaClient | undefined;
}

export const prisma = global.__prismaClient__ ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prismaClient__ = prisma;
}
