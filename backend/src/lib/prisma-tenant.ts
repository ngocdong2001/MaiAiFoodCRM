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

// Map to store active Prisma clients per tenant
const tenantClients = new Map<number, PrismaTenant>();

export const getPrismaTenant = (
  tenantId: number,
  databaseUrl: string,
): PrismaTenant => {
  // Return cached client if exists
  if (tenantClients.has(tenantId)) {
    return tenantClients.get(tenantId)!;
  }

  // Create new client for this tenant
  const opts = parseDbUrl(databaseUrl);
  const adapter = new PrismaMariaDb({
    host: opts.host,
    port: opts.port,
    user: opts.user,
    password: opts.password,
    database: opts.database,
    connectionLimit: 5,
  });

  const client = new PrismaTenant({ adapter });

  tenantClients.set(tenantId, client);
  return client;
};

export const disconnectPrismaTenant = async (tenantId: number) => {
  const client = tenantClients.get(tenantId);
  if (client) {
    await client.$disconnect();
    tenantClients.delete(tenantId);
  }
};

export const disconnectAllTenants = async () => {
  for (const [, client] of tenantClients) {
    await client.$disconnect();
  }
  tenantClients.clear();
};
