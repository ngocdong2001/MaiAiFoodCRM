// Compatibility shim - re-exports from tenant client for backward compatibility
// In multi-tenant mode, use req.tenantClient from auth middleware for actual queries
import { PrismaClient as PrismaTenant } from "../generated/prisma-tenant/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function parseDbUrl(url: string) {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port) || 3306,
    user: u.username,
    password: u.password,
    database: u.pathname.slice(1),
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient__: PrismaTenant | undefined;
}

// This singleton is a placeholder - actual tenant client comes from auth middleware
const dbUrl = process.env.DATABASE_URL_TENANT || "mysql://maiai:maiai@127.0.0.1:3307/maiai_crm_1";
const opts = parseDbUrl(dbUrl);
const adapter = new PrismaMariaDb({
  host: opts.host,
  port: opts.port,
  user: opts.user,
  password: opts.password,
  database: opts.database,
  connectionLimit: 5,
});

export const prisma = global.__prismaClient__ ?? new PrismaTenant({ adapter });

if (process.env.NODE_ENV !== "production") {
  global.__prismaClient__ = prisma;
}

// Re-export Prisma namespace from tenant client for type compatibility
export { Prisma } from "../generated/prisma-tenant/client.js";
