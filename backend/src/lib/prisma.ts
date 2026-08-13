import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// This file is kept for backward compatibility.
// Use prisma-master.ts and prisma-tenant.ts for multi-tenant operations.

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient__: PrismaClient | undefined;
}

const parseDbUrl = (url: string) => {
  const u = new URL(url);
  return {
    host: u.hostname,
    port: Number(u.port) || 3306,
    user: u.username,
    password: u.password,
    database: u.pathname.slice(1),
  };
};

const dbUrl = process.env.DATABASE_URL ?? process.env.DATABASE_URL_TENANT;

if (!dbUrl) {
  throw new Error(
    "Missing DATABASE_URL (or DATABASE_URL_TENANT) for Prisma connection",
  );
}

const parsed = parseDbUrl(dbUrl);
const adapter = new PrismaMariaDb({
  host: parsed.host,
  port: parsed.port,
  user: parsed.user,
  password: parsed.password,
  database: parsed.database,
  connectionLimit: 5,
});

export const prisma =
  global.__prismaClient__ ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  global.__prismaClient__ = prisma;
}
