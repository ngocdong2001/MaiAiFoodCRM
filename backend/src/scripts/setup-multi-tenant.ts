import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import bcrypt from "bcryptjs";

const execAsync = promisify(exec);

const MYSQL_HOST = "127.0.0.1";
const MYSQL_USER = "maiai";
const MYSQL_PASSWORD = "123";
const MASTER_DB = "maiai_master";

export const setupMultiTenant = async () => {
  console.log("🔧 Setting up Multi-Tenant Architecture...\n");

  try {
    // Step 1: Create master database
    console.log("📦 Step 1: Creating master database...");
    await createMasterDatabase();
    console.log("✅ Master database created\n");

    // Step 2: Run migrations on master
    console.log("📦 Step 2: Running migrations on master database...");
    process.env.DATABASE_URL_MASTER = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:3306/${MASTER_DB}`;
    await runMasterMigrations();
    console.log("✅ Master migrations completed\n");

    // Step 3: Create first tenant
    console.log("📦 Step 3: Creating default tenant...");
    const tenantId = await createDefaultTenant();
    console.log(`✅ Tenant created with ID: ${tenantId}\n`);

    // Step 4: Create tenant database and run migrations
    console.log("📦 Step 4: Setting up tenant database...");
    await createTenantDatabaseAndMigrate(tenantId);
    console.log(`✅ Tenant database setup completed\n`);

    // Step 5: Create admin user
    console.log("📦 Step 5: Creating admin user...");
    await createAdminUser(tenantId);
    console.log("✅ Admin user created\n");

    console.log("🎉 Multi-Tenant setup completed successfully!");
    console.log("\nℹ️  Admin Login:");
    console.log("   Email: admin@maiai.com");
    console.log("   Password: Admin@123");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
};

async function createMasterDatabase() {
  const createDbSql = `CREATE DATABASE IF NOT EXISTS ${MASTER_DB} 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;

  const cmd = `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -h ${MYSQL_HOST} -e "${createDbSql}"`;
  try {
    await execAsync(cmd);
  } catch (error) {
    console.error("Error creating master database:", error);
    throw error;
  }
}

async function runMasterMigrations() {
  const cmd = `cd backend && npx prisma migrate deploy --schema=./prisma/schema.master.prisma`;
  try {
    process.env.DATABASE_URL_MASTER = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:3306/${MASTER_DB}`;
    await execAsync(cmd);
  } catch (error) {
    console.error("Error running master migrations:", error);
    throw error;
  }
}

async function createDefaultTenant() {
  // Import Prisma after env is set
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("../generated/prisma-master/client.js");

  const prismaMaster = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_MASTER,
      },
    },
  });

  // Check if default tenant already exists
  let tenant = await prismaMaster.tenant.findUnique({
    where: { slug: "maiai-default" },
  });

  if (!tenant) {
    // Create default tenant
    tenant = await prismaMaster.tenant.create({
      data: {
        name: "MaiAI Default Salon",
        slug: "maiai-default",
        description: "Default salon for MaiAI CRM",
        tier: "basic",
        maxUsers: 5,
        maxGuests: 1000,
        databaseName: "maiai_crm_1", // Will create this DB
        updatedAt: new Date(),
      },
    });
  }

  await prismaMaster.$disconnect();
  return tenant.id;
}

async function createTenantDatabaseAndMigrate(tenantId: number) {
  const databaseName = `maiai_crm_${tenantId}`;
  const createDbSql = `CREATE DATABASE IF NOT EXISTS ${databaseName} 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;

  // Create database
  const cmd = `mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -h ${MYSQL_HOST} -e "${createDbSql}"`;
  try {
    await execAsync(cmd);
  } catch (error) {
    console.error(`Error creating tenant database ${databaseName}:`, error);
    throw error;
  }

  // Run migrations
  const migrationCmd = `cd backend && npx prisma migrate deploy --schema=./prisma/schema.tenant.prisma`;
  try {
    process.env.DATABASE_URL_TENANT = `mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:3306/${databaseName}`;
    await execAsync(migrationCmd);
  } catch (error) {
    console.error(`Error running tenant migrations for ${databaseName}:`, error);
    throw error;
  }
}

async function createAdminUser(tenantId: number) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require("../generated/prisma-master/client.js");

  const prismaMaster = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_MASTER,
      },
    },
  });

  const email = "admin@maiai.com";
  const password = "Admin@123";

  // Check if admin already exists
  let user = await prismaMaster.user.findUnique({
    where: { email },
  });

  if (!user) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prismaMaster.user.create({
      data: {
        tenantId,
        email,
        passwordHash,
        name: "Admin User",
        role: "owner",
        updatedAt: new Date(),
      },
    });
  }

  await prismaMaster.$disconnect();
  return user.id;
}

// Run setup if this is the main module
if (require.main === module) {
  setupMultiTenant().catch(console.error);
}
