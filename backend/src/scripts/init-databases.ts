#!/usr/bin/env npx ts-node

import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import bcrypt from "bcryptjs";

const execAsync = promisify(exec);

const MYSQL_PATH = 'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysql';
const MYSQL_HOST = "127.0.0.1";
const MYSQL_USER = "maiai";
const MYSQL_PASSWORD = "123";
const MASTER_DB = "maiai_master";
const TENANT_DB = "maiai_crm_1";

async function runSQL(database: string, sqlFile: string) {
  const sqlContent = fs.readFileSync(sqlFile, "utf-8");
  const tempFile = path.join(process.cwd(), "temp_migration.sql");
  fs.writeFileSync(tempFile, sqlContent);

  try {
    const cmd = `"${MYSQL_PATH}" -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -h ${MYSQL_HOST} ${database} --default-character-set=utf8mb4 < "${tempFile}"`;
    console.log(`Executing: ${cmd}`);
    await execAsync(cmd, { shell: "powershell.exe" });
  } finally {
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

async function setup() {
  console.log("🔧 Setting up Multi-Tenant Architecture...\n");

  try {
    // Step 1: Create databases
    console.log("📦 Step 1: Creating databases...");
    const createDbsCmd = `& "${MYSQL_PATH}" -u root -h ${MYSQL_HOST} -e "DROP DATABASE IF EXISTS ${MASTER_DB}; CREATE DATABASE ${MASTER_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; DROP DATABASE IF EXISTS ${TENANT_DB}; CREATE DATABASE ${TENANT_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; GRANT ALL PRIVILEGES ON ${MASTER_DB}.* TO '${MYSQL_USER}'@'${MYSQL_HOST}'; GRANT ALL PRIVILEGES ON ${TENANT_DB}.* TO '${MYSQL_USER}'@'${MYSQL_HOST}';"`;
    await execAsync(createDbsCmd, { shell: "powershell.exe" });
    console.log("✅ Databases created\n");

    // Step 2: Apply master migration
    console.log("📦 Step 2: Creating master schema...");
    await runSQL(MASTER_DB, "prisma/migrations/20260804000000_init_master/migration.sql");
    console.log("✅ Master schema created\n");

    // Step 3: Apply tenant migration
    console.log("📦 Step 3: Creating tenant schema...");
    await runSQL(TENANT_DB, "prisma/migrations_tenant/20260803000100_init_crm/migration.sql");
    console.log("✅ Tenant schema created\n");

    // Step 4: Create master DB migration records
    console.log("📦 Step 4: Registering migrations...");
    const migrationInsert = `INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) VALUES
      ('master-20260804000000', 'checksum1', NOW(), '20260804000000_init_master', NULL, NULL, NOW(), 1),
      ('tenant-20260803000100', 'checksum2', NOW(), '20260803000100_init_crm', NULL, NULL, NOW(), 1)`;

    const insertCmd = `& "${MYSQL_PATH}" -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -h ${MYSQL_HOST} ${MASTER_DB} -e "${migrationInsert}"`;
    try {
      await execAsync(insertCmd, { shell: "powershell.exe" });
    } catch (e) {
      // Ignore if migration records already exist
    }
    console.log("✅ Migrations registered\n");

    // Step 5: Create default tenant record
    console.log("📦 Step 5: Creating default tenant...");
    const tenantInsert = `INSERT INTO tenant (slug, name, databaseName, tier, maxUsers, maxGuests, isActive, createdAt, updatedAt) VALUES ('maiai-default', 'MaiAI Default Salon', '${TENANT_DB}', 'basic', 5, 1000, true, NOW(), NOW())`;
    const tenantCmd = `& "${MYSQL_PATH}" -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -h ${MYSQL_HOST} ${MASTER_DB} -e "${tenantInsert}"`;
    await execAsync(tenantCmd, { shell: "powershell.exe" });
    console.log("✅ Tenant created\n");

    // Step 6: Create admin user
    console.log("📦 Step 6: Creating admin user...");
    const passwordHash = await bcrypt.hash("Admin@123", 10);
    const userInsert = `INSERT INTO user (tenantId, email, passwordHash, name, role, isActive, createdAt, updatedAt) VALUES (1, 'admin@maiai.com', '${passwordHash}', 'Admin User', 'admin', true, NOW(), NOW())`;
    const userCmd = `& "${MYSQL_PATH}" -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -h ${MYSQL_HOST} ${MASTER_DB} -e "${userInsert}"`;
    await execAsync(userCmd, { shell: "powershell.exe" });
    console.log("✅ Admin user created\n");

    console.log("🎉 Multi-Tenant setup completed successfully!\n");
    console.log("ℹ️  Admin Login:");
    console.log("   Email: admin@maiai.com");
    console.log("   Password: Admin@123\n");
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

setup();
