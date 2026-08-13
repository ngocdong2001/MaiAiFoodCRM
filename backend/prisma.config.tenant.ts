import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.tenant.prisma",
  migrations: {
    path: "prisma/migrations_tenant",
  },
  datasource: {
    url: process.env.DATABASE_URL_TENANT!,
  },
});
