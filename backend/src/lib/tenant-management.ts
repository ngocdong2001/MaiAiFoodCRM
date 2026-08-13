import { getPrismaMaster } from "./prisma-master.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const createTenantDatabase = async (tenantId: number, tenantName: string) => {
  const databaseName = `maiai_crm_${tenantId}`;

  // Create database for tenant
  const createDbSql = `
    CREATE DATABASE IF NOT EXISTS ${databaseName} 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `;

  try {
    // Execute via mysql command line
    const cmd = `mysql -u maiai -p123 -h 127.0.0.1 -e "${createDbSql}"`;
    await execAsync(cmd);

    console.log(`Database ${databaseName} created successfully`);

    // Run migrations for tenant database
    const migrationCmd = `cd backend && npx prisma migrate deploy --schema=./prisma/schema.tenant.prisma`;
    process.env.DATABASE_URL_TENANT = `mysql://maiai:123@127.0.0.1:3306/${databaseName}`;
    await execAsync(migrationCmd);

    console.log(`Migrations applied to ${databaseName}`);

    return { databaseName, success: true };
  } catch (error) {
    console.error(`Failed to create tenant database ${databaseName}:`, error);
    throw error;
  }
};

export const getOrCreateTenant = async (
  name: string,
  slug: string,
): Promise<{ id: number; databaseName: string }> => {
  const prismaMaster = getPrismaMaster();

  // Check if tenant exists
  let tenant = await prismaMaster.tenant.findUnique({
    where: { slug },
  });

  if (!tenant) {
    // Create new tenant
    tenant = await prismaMaster.tenant.create({
      data: {
        name,
        slug,
        databaseName: `maiai_crm_${Date.now()}`, // Temporary name, will be updated with ID
        tier: "basic",
        maxUsers: 5,
        maxGuests: 1000,
      },
    });

    // Update databaseName with actual tenant ID
    const databaseName = `maiai_crm_${tenant.id}`;
    tenant = await prismaMaster.tenant.update({
      where: { id: tenant.id },
      data: { databaseName },
    });

    // Create the database
    await createTenantDatabase(tenant.id, name);
  }

  return {
    id: tenant.id,
    databaseName: tenant.databaseName,
  };
};
