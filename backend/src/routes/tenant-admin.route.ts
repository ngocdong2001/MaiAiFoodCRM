import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { execSync } from "child_process";
import { getPrismaMaster } from "../lib/prisma-master.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient as PrismaTenant } from "../generated/prisma-tenant/client.js";
import { isRole } from "../types/roles.js";

const router = Router();

// ─── Helper: Create tenant database + run Prisma migrations ────────────────

async function createTenantDatabase(databaseName: string): Promise<void> {
  const masterUrl = process.env.DATABASE_URL_MASTER;
  if (!masterUrl) throw new Error("DATABASE_URL_MASTER not set");

  const u = new URL(masterUrl);
  const host = u.hostname;
  const port = Number(u.port) || 3306;
  const user = u.username;
  const password = u.password;

  // 1. Create the database via raw SQL (maiai has CREATE privilege on *.*)
  const masterAdapter = new PrismaMariaDb({
    host, port, user, password,
    database: "maiai_master",
    connectionLimit: 1,
  });
  const { PrismaClient } = await import("../generated/prisma-master/client.js");
  const prismaMaster = new PrismaClient({ adapter: masterAdapter });
  await prismaMaster.$executeRawUnsafe(
    `CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await prismaMaster.$disconnect();

  // 2. Run Prisma tenant migrations via CLI
  const tenantUrl = `mysql://${user}:${password}@${host}:${port}/${databaseName}`;
  try {
    execSync(
      `npx prisma migrate deploy --schema ./prisma/schema.tenant.prisma --config ./prisma.config.tenant.ts`,
      {
        cwd: "/app",
        env: { ...process.env, DATABASE_URL_TENANT: tenantUrl },
        timeout: 30000,
        stdio: "pipe",
      }
    );
    console.log(`[TenantAdmin] ✅ Migrated tenant DB: ${databaseName}`);
  } catch (migErr: any) {
    const errMsg = migErr.stderr?.toString() || migErr.message;
    console.error(`[TenantAdmin] ❌ Migration failed for ${databaseName}:`, errMsg);
    throw new Error(`Database created but migration failed: ${errMsg}`);
  }
}

// Admin API key guard — all /api/admin/* routes require X-Admin-Key header
router.use((req: Request, res: Response, next: NextFunction) => {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    res.status(503).json({ ok: false, error: "Admin access not configured" });
    return;
  }
  if (req.headers["x-admin-key"] !== adminKey) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return;
  }
  next();
});

// ─── GET /api/admin/tenants/:id ─────────────────────────────────────────────
// Get tenant detail with users list

router.get("/tenants/:id", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    if (Number.isNaN(tenantId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant ID" });
      return;
    }

    const prismaMaster = getPrismaMaster();
    const tenant = await prismaMaster.tenant.findUnique({
      where: { id: tenantId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            phone: true,
            avatarUrl: true,
            lastLoginAt: true,
            createdAt: true,
          },
        },
      },
    });

    if (!tenant) {
      res.status(404).json({ ok: false, error: "Tenant not found" });
      return;
    }

    res.json({
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      description: tenant.description,
      logoUrl: tenant.logoUrl,
      databaseName: tenant.databaseName,
      tier: tenant.tier,
      maxUsers: tenant.maxUsers,
      maxGuests: tenant.maxGuests,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt?.toISOString(),
      updatedAt: tenant.updatedAt?.toISOString(),
      users: tenant.users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt?.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[TenantAdmin] Error getting tenant:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── GET /api/admin/tenants ─────────────────────────────────────────────────
// List all tenants (for admin dashboard)

router.get("/tenants", async (_req, res) => {
  try {
    const prismaMaster = getPrismaMaster();
    const tenants = await prismaMaster.tenant.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      tenants.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        description: t.description,
        logoUrl: t.logoUrl,
        databaseName: t.databaseName,
        tier: t.tier,
        maxUsers: t.maxUsers,
        maxGuests: t.maxGuests,
        isActive: t.isActive,
        createdAt: t.createdAt?.toISOString(),
        updatedAt: t.updatedAt?.toISOString(),
        users: t.users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          isActive: u.isActive,
        })),
      }))
    );
  } catch (err) {
    console.error("[TenantAdmin] Error listing tenants:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── POST /api/admin/tenants ────────────────────────────────────────────────
// Create a new tenant with admin user

router.post("/tenants", async (req, res) => {
  try {
    const { name, slug, email, password, description, tier } = req.body;

    if (!name || !slug || !email || !password) {
      res.status(400).json({
        ok: false,
        error: "Missing required fields: name, slug, email, password",
      });
      return;
    }

    const prismaMaster = getPrismaMaster();

    // Check slug uniqueness
    const existing = await prismaMaster.tenant.findUnique({ where: { slug } });
    if (existing) {
      res.status(409).json({ ok: false, error: `Tenant slug "${slug}" already exists` });
      return;
    }

    const databaseName = `maiai_crm_${slug.replace(/[^a-z0-9]/g, "_")}`;
    const passwordHash = await bcrypt.hash(String(password), 12);

    const tenantNow = new Date();
    const tenant = await prismaMaster.tenant.create({
      data: {
        name: String(name),
        slug: String(slug),
        description: description ? String(description) : null,
        databaseName,
        tier: tier || "basic",
        updatedAt: tenantNow,
      },
      include: { users: true },
    });

    // Create admin user separately
    const now = new Date();
    const adminUser = await prismaMaster.user.create({
      data: {
        tenantId: tenant.id,
        email: String(email).toLowerCase().trim(),
        passwordHash,
        name: String(name),
        role: "admin",
        updatedAt: now,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // Create tenant database and run migrations
    let databaseCreated = false;
    let databaseError: string | null = null;
    try {
      await createTenantDatabase(databaseName);
      databaseCreated = true;
    } catch (dbErr: any) {
      databaseError = dbErr.message;
      console.error("[TenantAdmin] Tenant DB setup error:", dbErr.message);
    }

    res.status(201).json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        databaseName: tenant.databaseName,
      },
      admin: adminUser,
      database: {
        created: databaseCreated,
        ...(databaseError ? { error: databaseError } : {}),
      },
      message: databaseCreated
        ? "Tenant created successfully with database"
        : "Tenant created but database setup failed — run migration manually",
    });
  } catch (err) {
    console.error("[TenantAdmin] Error creating tenant:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── PATCH /api/admin/tenants/:id ───────────────────────────────────────────
// Update tenant fields

router.patch("/tenants/:id", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    if (Number.isNaN(tenantId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant ID" });
      return;
    }

    const prismaMaster = getPrismaMaster();
    const { name, description, tier, isActive, maxUsers, maxGuests } = req.body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name);
    if (description !== undefined) data.description = description ? String(description) : null;
    if (tier !== undefined) data.tier = String(tier);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (maxUsers !== undefined) data.maxUsers = Number(maxUsers);
    if (maxGuests !== undefined) data.maxGuests = Number(maxGuests);

    const tenant = await prismaMaster.tenant.update({
      where: { id: tenantId },
      data,
    });

    res.json({
      ok: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        databaseName: tenant.databaseName,
        tier: tenant.tier,
        isActive: tenant.isActive,
      },
    });
  } catch (err) {
    console.error("[TenantAdmin] Error updating tenant:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── DELETE /api/admin/tenants/:id ──────────────────────────────────────────
// Delete tenant and drop database

router.delete("/tenants/:id", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    if (Number.isNaN(tenantId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant ID" });
      return;
    }

    const prismaMaster = getPrismaMaster();
    const tenant = await prismaMaster.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ ok: false, error: "Tenant not found" });
      return;
    }

    // Drop the tenant database
    let databaseDropped: string | undefined;
    try {
      const { PrismaClient: PrismaTenant } = await import("../generated/prisma-tenant/client.js");
      const { PrismaMariaDb } = await import("@prisma/adapter-mariadb");
      const dbUrl = process.env.DATABASE_URL_MASTER!;
      const u = new URL(dbUrl);
      const adapter = new PrismaMariaDb({
        host: u.hostname,
        port: Number(u.port) || 3306,
        user: u.username,
        password: u.password,
        database: tenant.databaseName,
        connectionLimit: 1,
      });
      const tmpPrisma = new PrismaTenant({ adapter });
      await tmpPrisma.$executeRawUnsafe(`DROP DATABASE IF EXISTS \`${tenant.databaseName}\``);
      await tmpPrisma.$disconnect();
      databaseDropped = tenant.databaseName;
    } catch (dropErr) {
      console.warn("[TenantAdmin] Could not drop database:", dropErr);
    }

    // Delete tenant (cascades to users)
    await prismaMaster.tenant.delete({ where: { id: tenantId } });

    res.json({
      ok: true,
      message: `Tenant "${tenant.name}" deleted`,
      databaseDropped,
    });
  } catch (err) {
    console.error("[TenantAdmin] Error deleting tenant:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── GET /api/admin/tenants/:id/users ───────────────────────────────────────
// List users for a tenant

router.get("/tenants/:id/users", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    if (Number.isNaN(tenantId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant ID" });
      return;
    }

    const prismaMaster = getPrismaMaster();
    const users = await prismaMaster.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        phone: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      ok: true,
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        phone: u.phone,
        avatarUrl: u.avatarUrl,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt?.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[TenantAdmin] Error listing users:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── POST /api/admin/tenants/:id/users ──────────────────────────────────────
// Create a new user for a tenant

router.post("/tenants/:id/users", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    if (Number.isNaN(tenantId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant ID" });
      return;
    }

    const prismaMaster = getPrismaMaster();
    const { email, password, name, role, phone } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ ok: false, error: "Missing required fields: email, password, name" });
      return;
    }

    // Check tenant exists and user limit
    const tenant = await prismaMaster.tenant.findUnique({
      where: { id: tenantId },
      include: { _count: { select: { users: true } } },
    });
    if (!tenant) {
      res.status(404).json({ ok: false, error: "Tenant not found" });
      return;
    }
    if (tenant._count.users >= tenant.maxUsers) {
      res.status(409).json({ ok: false, error: `User limit reached (${tenant.maxUsers})` });
      return;
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const passwordHash = await bcrypt.hash(String(password), 12);

    const userNow = new Date();
    const user = await prismaMaster.user.create({
      data: {
        tenantId,
        email: normalizedEmail,
        passwordHash,
        name: String(name).trim(),
        role: isRole(role) ? role : "staff",
        phone: phone ? String(phone).trim() : null,
        updatedAt: userNow,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        phone: true,
        createdAt: true,
      },
    });

    res.status(201).json({ ok: true, user });
  } catch (err: any) {
    if (err?.code === "P2002") {
      res.status(409).json({ ok: false, error: "Email already exists in this tenant" });
      return;
    }
    console.error("[TenantAdmin] Error creating user:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── POST /api/admin/tenants/:id/users/:userId/reset-password ───────────────
// Reset a user's password (admin operation)

router.post("/tenants/:id/users/:userId/reset-password", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    const userId = Number(req.params.userId);
    if (Number.isNaN(tenantId) || Number.isNaN(userId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant or user ID" });
      return;
    }

    const prismaMaster = getPrismaMaster();

    // Verify user belongs to this tenant
    const user = await prismaMaster.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user) {
      res.status(404).json({ ok: false, error: "User not found in this tenant" });
      return;
    }

    // Use provided password or generate a default one
    const newPassword = req.body?.password || "Admin@123";
    const passwordHash = await bcrypt.hash(String(newPassword), 12);

    await prismaMaster.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    res.json({
      ok: true,
      message: `Password reset for ${user.email}`,
      email: user.email,
      // Only reveal the password if caller provided one; otherwise indicate default was used
      ...(req.body?.password ? {} : { note: "Default password applied" }),
    });
  } catch (err) {
    console.error("[TenantAdmin] Error resetting password:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── PATCH /api/admin/tenants/:id/users/:userId ─────────────────────────────
// Update user fields (role, isActive, name, etc.)

router.patch("/tenants/:id/users/:userId", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    const userId = Number(req.params.userId);
    if (Number.isNaN(tenantId) || Number.isNaN(userId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant or user ID" });
      return;
    }

    const prismaMaster = getPrismaMaster();

    const user = await prismaMaster.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user) {
      res.status(404).json({ ok: false, error: "User not found in this tenant" });
      return;
    }

    const { name, role, isActive, phone } = req.body;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = String(name).trim();
    if (role !== undefined) {
      if (!isRole(role)) {
        res.status(400).json({ ok: false, error: `Invalid role: ${role}` });
        return;
      }
      data.role = role;
    }
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (phone !== undefined) data.phone = phone ? String(phone).trim() : null;

    const updated = await prismaMaster.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        phone: true,
      },
    });

    res.json({ ok: true, user: updated });
  } catch (err) {
    console.error("[TenantAdmin] Error updating user:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── DELETE /api/admin/tenants/:id/users/:userId ────────────────────────────
// Delete a user from a tenant

router.delete("/tenants/:id/users/:userId", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    const userId = Number(req.params.userId);
    if (Number.isNaN(tenantId) || Number.isNaN(userId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant or user ID" });
      return;
    }

    const prismaMaster = getPrismaMaster();

    const user = await prismaMaster.user.findFirst({
      where: { id: userId, tenantId },
    });
    if (!user) {
      res.status(404).json({ ok: false, error: "User not found in this tenant" });
      return;
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await prismaMaster.user.count({
        where: { tenantId, role: "admin", isActive: true },
      });
      if (adminCount <= 1) {
        res.status(409).json({ ok: false, error: "Cannot delete the last admin user" });
        return;
      }
    }

    await prismaMaster.user.delete({ where: { id: userId } });

    res.json({ ok: true, message: `User "${user.email}" deleted` });
  } catch (err) {
    console.error("[TenantAdmin] Error deleting user:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// ─── GET /api/admin/tenants/:id/database-info ───────────────────────────────
// Get database info for a tenant

router.get("/tenants/:id/database-info", async (req, res) => {
  try {
    const tenantId = Number(req.params.id);
    if (Number.isNaN(tenantId)) {
      res.status(400).json({ ok: false, error: "Invalid tenant ID" });
      return;
    }

    const prismaMaster = getPrismaMaster();
    const tenant = await prismaMaster.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      res.status(404).json({ ok: false, error: "Tenant not found" });
      return;
    }

    // Connect to the tenant database to get stats
    const dbUrl = process.env.DATABASE_URL_MASTER!;
    const u = new URL(dbUrl);

    const { PrismaClient: PrismaTenant } = await import("../generated/prisma-tenant/client.js");
    const { PrismaMariaDb } = await import("@prisma/adapter-mariadb");

    const adapter = new PrismaMariaDb({
      host: u.hostname,
      port: Number(u.port) || 3306,
      user: u.username,
      password: u.password,
      database: tenant.databaseName,
      connectionLimit: 2,
    });
    const tenantPrisma = new PrismaTenant({ adapter });

    // Get table list with sizes
    const dbName = tenant.databaseName;
    const tables = await tenantPrisma.$queryRawUnsafe<
      Array<{
        table_name: string;
        table_rows: bigint;
        data_length: bigint;
        index_length: bigint;
        total_size: bigint;
        update_time: string | null;
      }>
    >(
      `SELECT table_name, table_rows, data_length, index_length, (data_length + index_length) AS total_size, update_time FROM information_schema.tables WHERE table_schema = '${dbName}' AND table_type = 'BASE TABLE' ORDER BY table_name`
    );

    // Get database size
    const dbSize = await tenantPrisma.$queryRawUnsafe<Array<{ total: bigint }>>(
      `SELECT SUM(data_length + index_length) AS total FROM information_schema.tables WHERE table_schema = '${dbName}'`
    );

    // Get version
    const version = await tenantPrisma.$queryRawUnsafe<Array<{ version: string }>>(
      `SELECT VERSION() AS version`
    );

    await tenantPrisma.$disconnect();

    res.json({
      ok: true,
      database: {
        name: tenant.databaseName,
        host: u.hostname,
        port: Number(u.port) || 3306,
        version: version[0]?.version || "MariaDB",
        totalSize: Number(dbSize[0]?.total || 0),
        isSslActive: dbUrl.includes("ssl"),
      },
      tables: tables.map((t) => ({
        name: t.table_name,
        rowCount: Number(t.table_rows || 0),
        dataSize: Number(t.data_length || 0),
        indexSize: Number(t.index_length || 0),
        totalSize: Number(t.total_size || 0),
        lastUpdated: t.update_time || null,
      })),
    });
  } catch (err) {
    console.error("[TenantAdmin] Error getting database info:", err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
