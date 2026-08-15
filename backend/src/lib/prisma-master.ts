import { PrismaClient as PrismaMaster } from "../generated/prisma-master/client.js";
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

let prismaMaster: PrismaMaster | null = null;

export const getPrismaMaster = (): PrismaMaster => {
  if (prismaMaster) return prismaMaster;

  const dbUrl = process.env.DATABASE_URL_MASTER ?? process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error(
      "Missing DATABASE_URL_MASTER (or DATABASE_URL) for Prisma master connection",
    );
  }
  const opts = parseDbUrl(dbUrl);
  const adapter = new PrismaMariaDb({
    host: opts.host,
    port: opts.port,
    user: opts.user,
    password: opts.password,
    database: opts.database,
    connectionLimit: 5,
  });

  prismaMaster = new PrismaMaster({ adapter });
  return prismaMaster;
};

export const disconnectPrismaMaster = async () => {
  if (prismaMaster) {
    await prismaMaster.$disconnect();
    prismaMaster = null;
  }
};
