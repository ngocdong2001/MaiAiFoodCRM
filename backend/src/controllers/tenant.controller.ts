import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { createConnection } from "mariadb";

import { getPrismaMaster } from "../lib/prisma-master.js";
import { getPrismaTenant, disconnectPrismaTenant } from "../lib/prisma-tenant.js";

// __dirname is available in CommonJS modules

// Resolve project root (backend/)
const PROJECT_ROOT = resolve(__dirname, "../..");

// ─── Helper: create a raw MariaDB connection ────────────────────────────────
async function getRawConnection(database?: string) {
  const url = new URL(process.env.DATABASE_URL_MASTER!);
  return createConnection({
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: database || undefined,
    multipleStatements: true,
  });
}

// ─── POST /api/admin/tenants ────────────────────────────────────────────────
export const createTenant = async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaMaster();

    const { name, slug, email, password, description, tier } = req.body;

    if (!name || !slug || !email || !password) {
      return res.status(400).json({
        message: "Missing required fields: name, slug, email, password",
      });
    }

    // 1. Check slug uniqueness
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: "Slug already exists" });
    }

    // 2. Create tenant record (get the auto-generated id)
    const tenant = await prisma.tenant.create({
      data: {
        name,
        slug,
        description: description || null,
        databaseName: `maiai_crm_0`, // placeholder, updated below
        tier: tier || "basic",
        maxUsers: 5,
        maxGuests: 1000,
        isActive: true,
        updatedAt: new Date(),
      },
    });

    const databaseName = `maiai_crm_${tenant.id}`;

    // 3. Update tenant with correct databaseName
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { databaseName },
    });

    // 4. Create database + run tenant schema migration
    const conn = await getRawConnection();
    try {
      await conn.query(
        `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
    } finally {
      await conn.end();
    }

    // Read and execute tenant migration SQL
    const migrationPath = join(
      PROJECT_ROOT,
      "prisma/migrations_tenant/20260803000100_init_crm/migration.sql",
    );

    console.log("Migration path:", migrationPath);
    console.log("File exists:", existsSync(migrationPath));

    if (!existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = readFileSync(migrationPath, "utf-8");
    console.log("Migration SQL length:", migrationSQL.length);
    const statements = migrationSQL
      .split(";")
      .map((s) => {
        // Strip leading SQL comments (-- ...) and whitespace
        return s.replace(/^\s*--.*$/gm, "").trim();
      })
      .filter((s) => s.length > 10);

    const tenantConn = await getRawConnection(databaseName);
    try {
      for (const stmt of statements) {
        await tenantConn.query(stmt);
      }
    } finally {
      await tenantConn.end();
    }

    // 5. Create admin user for the new tenant
    const passwordHash = await bcrypt.hash(password, 10);
    const adminUser = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
        name: name + " Admin",
        role: "owner",
        isActive: true,
        updatedAt: new Date(),
      },
    });

    return res.status(201).json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        databaseName,
      },
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    });
  } catch (error: any) {
    console.error("Create tenant error:", error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
};

// ─── GET /api/admin/tenants ─────────────────────────────────────────────────
export const listTenants = async (_req: Request, res: Response) => {
  try {
    const prisma = getPrismaMaster();
    const tenants = await prisma.tenant.findMany({
      include: { users: { select: { id: true, email: true, name: true, role: true } } },
      orderBy: { id: "asc" },
    });
    return res.json({ tenants });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/admin/tenants/:id ─────────────────────────────────────────────
export const getTenant = async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaMaster();
    const id = Number(req.params.id);

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { users: { select: { id: true, email: true, name: true, role: true, isActive: true } } },
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    return res.json({ tenant });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── PATCH /api/admin/tenants/:id ───────────────────────────────────────────
export const updateTenant = async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaMaster();
    const id = Number(req.params.id);
    const { name, description, tier, isActive, maxUsers, maxGuests } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(tier !== undefined && { tier }),
        ...(isActive !== undefined && { isActive }),
        ...(maxUsers !== undefined && { maxUsers }),
        ...(maxGuests !== undefined && { maxGuests }),
        updatedAt: new Date(),
      },
    });

    return res.json({ tenant });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── DELETE /api/admin/tenants/:id ──────────────────────────────────────────
export const deleteTenant = async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaMaster();
    const id = Number(req.params.id);

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Disconnect cached tenant client if any
    await disconnectPrismaTenant(id);

    // Drop the tenant database
    const conn = await getRawConnection();
    try {
      await conn.query(`DROP DATABASE IF EXISTS \`${tenant.databaseName}\``);
    } finally {
      await conn.end();
    }

    // Delete tenant record (cascades to users)
    await prisma.tenant.delete({ where: { id } });

    return res.json({ message: `Tenant "${tenant.name}" deleted`, databaseDropped: tenant.databaseName });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── GET /api/admin/tenants/:id/database-info ──────────────────────────────
export const getDatabaseInfo = async (req: Request, res: Response) => {
  try {
    const prisma = getPrismaMaster();
    const id = Number(req.params.id);

    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    const conn = await getRawConnection(tenant.databaseName);
    try {
      // Get tables with row counts and data sizes
      const tables = await conn.query(`
        SELECT
          TABLE_NAME    AS tableName,
          TABLE_ROWS    AS rowCount,
          DATA_LENGTH   AS dataSize,
          INDEX_LENGTH  AS indexSize,
          UPDATE_TIME   AS lastUpdated
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = ?
          AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY DATA_LENGTH DESC
      `, [tenant.databaseName]);

      // Get total database size
      const [sizeRow] = await conn.query(`
        SELECT
          SUM(DATA_LENGTH + INDEX_LENGTH) AS totalSize
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
      `, [tenant.databaseName]);

      // Get MariaDB version
      const [versionRow] = await conn.query(`SELECT VERSION() AS version`);

      // Get connection info
      const url = new URL(process.env.DATABASE_URL_MASTER!);

      return res.json({
        ok: true,
        database: {
          name: tenant.databaseName,
          host: url.hostname,
          port: Number(url.port) || 3306,
          version: versionRow?.version || "MariaDB",
          totalSize: Number(sizeRow?.totalSize || 0),
          isSslActive: true,
        },
        tables: tables.map((t: any) => ({
          name: t.tableName,
          rowCount: Number(t.rowCount) || 0,
          dataSize: Number(t.dataSize) || 0,
          indexSize: Number(t.indexSize) || 0,
          totalSize: Number(Number(t.dataSize || 0) + Number(t.indexSize || 0)),
          lastUpdated: t.lastUpdated || null,
        })),
      });
    } finally {
      await conn.end();
    }
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
