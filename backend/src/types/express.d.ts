import { PrismaClient as PrismaTenant } from "../generated/prisma-tenant/client.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        tenantId: number;
        name: string;
        email: string;
        role: string;
      };
      tenant?: {
        id: number;
        name: string;
        databaseUrl: string;
      };
      tenantClient?: PrismaTenant;
    }
  }
}

export {};
