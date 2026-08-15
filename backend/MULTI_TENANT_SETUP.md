# MaiAI CRM - Database-per-Tenant Setup Guide

## 🏗️ Architecture Overview

This CRM uses a **Database-per-Tenant** architecture for multi-tenancy:

```
MariaDB Server (mariadb-crm :3307)
│
├── maiai_master (Global - Shared)
│   ├── tenant          (salon registry: slug, name, databaseName, tier, maxUsers)
│   └── user            (users: email, passwordHash, role, tenantId)
│       Roles: admin | manager | staff
│       Constraint: @@unique([tenantId, email])
│
├── maiai_crm_1 (Tenant 1 - Isolated)
│   ├── guest, guestnote, guesttag, guesttagmapping
│   ├── appointment, appointmentservice
│   ├── staff, staffschedule, staffspecialty, staffspecialtymapping
│   ├── service, servicecategory
│   ├── payment, refund
│   ├── setting, auditlog
│   ├── airecommendation, upsellcampaign
│   └── (19 tables: business + tenant users)
│
└── maiai_crm_N (Tenant N - Isolated)
    └── (same 19 tables, fully isolated)
```

**Benefits:**
- ✅ Complete data isolation between tenants
- ✅ Independent backup / restore per salon
- ✅ Easy GDPR compliance — drop one database to delete all tenant data
- ✅ Each tenant can be migrated or scaled independently

## 🐳 Quick Start (Docker — recommended)

The workspace root uses `docker-compose-sub.yml` which runs **all** services in a shared bridge network.

```powershell
# From workspace root
cd "d:\Learning\AI Call bot"

# Start everything (MariaDB × 2, CallCenterAdmin, MaiAICRM backend + frontend)
docker compose -f docker-compose-sub.yml up -d

# Or only the CRM pieces
docker compose -f docker-compose-sub.yml up -d maiai-backend maiai-frontend
```

| Service | Container | Port |
|---------|-----------|------|
| MariaDB (CallCenterAdmin) | shared-mariadb | 3306 |
| MariaDB (MaiAICRM) | maiai-mariadb | 3307 |
| CallCenterAdmin API | callcenteradmin-app | 4000 |
| MaiAICRM Backend | maiai-backend | 3001 |
| MaiAICRM Frontend | maiai-frontend | 3000 |

> **Network:** All containers share `aicallbot_shared-net`, so service discovery uses container names (`maiai-backend`, `mariadb-crm`, etc.).

### Environment Variables (MaiAICRM Backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL_MASTER` | `mysql://maiai:maiai@mariadb-crm:3306/maiai_master` | Master DB connection |
| `DATABASE_URL_TENANT` | `mysql://maiai:maiai@mariadb-crm:3306/maiai_crm_1` | Tenant DB template |
| `PORT` | `3001` | Backend listen port |
| `JWT_SECRET` | `maiai-jwt-secret-change-in-production` | JWT signing key |

### CallCenterAdmin → MaiAICRM Integration

CallCenterAdmin provisions CRM tenants and manages admin users via:

| Variable | Value |
|----------|-------|
| `CRM_BACKEND_URL` | `http://maiai-backend:3001` |
| `CRM_ADMIN_EMAIL` | `admin@maiai.com` |
| `CRM_ADMIN_PASSWORD` | `Admin@123` |

**Provisioning flow:**
```
CallCenterAdmin → POST /api/clients/:id/crm-provision
    → MaiAICRM POST /api/admin/tenants
    → Creates tenant + database + admin user
```

**Admin user management flow:**
```
CallCenterAdmin UI (DatabaseTab → AdminAccountSection)
    → GET  /api/clients/:id/crm-admin-users        → List users
    → POST /api/clients/:id/crm-admin-create-user   → Create user
    → POST /api/clients/:id/crm-admin-reset-password → Reset password
    → PATCH /api/clients/:id/crm-admin-update-user/:userId → Update user
    → DELETE /api/clients/:id/crm-admin-delete-user/:userId → Delete user
        ↓
    CallCenterAdmin proxy resolves clientId → crmTenantId
        ↓
    MaiAICRM /api/admin/tenants/:tenantId/users/*
```

The CallCenterAdmin backend automatically resolves `clientId → crmTenantId` by looking up the `crmTenantId` field on the local `client` table, so the frontend only needs to pass `clientId`.

## 🚀 Manual Setup (without Docker)

### Step 1: Install Dependencies

```bash
cd MaiAICRM/backend
npm install
npm run prisma:generate
```

### Step 2: Create Master Database & Admin User

```bash
npm run setup:multi-tenant
```

This script will:
1. Create `maiai_master` database
2. Run master migrations (`tenant`, `user` tables)
3. Create default tenant "MaiAI Default Salon"
4. Create `maiai_crm_1` database for the default tenant
5. Run tenant migrations on `maiai_crm_1`
6. Create admin user

**Default Admin Credentials:**
```
Email:    admin@maiai.com
Password: Admin@123
```

### Step 3: Start Backend

```bash
npm run dev          # runs on port 3001
```

### Step 4: Start Frontend (in another terminal)

```bash
cd ../frontend
npm run dev          # runs on port 3000
```

### Step 5: Test Login

Visit `http://localhost:3000` and login with admin credentials.

## 🔑 Key Concepts

### JWT Token

The JWT token now includes `tenantId`:

```javascript
{
  sub: 1,           // User ID
  tenantId: 1,      // Tenant ID
  email: "admin@maiai.com",
  role: "owner"
}
```

### Middleware Flow

```
Request with JWT
    ↓
Extract tenantId from token
    ↓
Look up tenant in master DB
    ↓
Get tenant's database name (maiai_crm_{tenantId})
    ↓
Create/retrieve Prisma client for tenant DB
    ↓
Attach to req.tenantClient
    ↓
Handler uses req.tenantClient for all queries
    ↓
Data automatically scoped to tenant
```

## 📝 Usage Examples

### Backend - Using Tenant Client

```typescript
// In any protected route handler
export const getGuests = async (req: Request, res: Response) => {
  // Middleware already resolved tenant client
  const guests = await req.tenantClient!.guest.findMany();
  res.json(guests);
};

// ✅ DO use req.tenantClient
// ❌ DON'T use global prisma instance
```

### Frontend - Auth State

```typescript
import { useAuthStore } from "@/core/store/zustandStore";

// Get current user & tenant
const { user, tenant, token } = useAuthStore();

// After login
const response = await authService.login(email, password);
useAuthStore.setState({
  user: response.user,      // includes tenantId
  tenant: response.tenant,  // salon info
  token: response.token
});
```

## 🔄 Prisma Management

### Generate Clients for Both Schemas

```bash
npm run prisma:generate
# or separately:
npm run prisma:generate-master
npm run prisma:generate-tenant
```

Generated clients in:
- `backend/src/generated/prisma-master` - For master DB
- `backend/src/generated/prisma-tenant` - For tenant DBs

### Run Migrations

```bash
# Deploy all migrations
npm run migrate:deploy

# Or separately
npm run migrate:deploy-master
npm run migrate:deploy-tenant

# Development with schema changes
npm run migrate:dev-master
npm run migrate:dev-tenant
```

## 🗄️ Tenant Database Migration

When a new tenant is created via `POST /api/admin/tenants`, the backend automatically provisions its database. This is **not** Prisma Migrate — it reads raw SQL files from a directory and executes them in order.

### How It Works

```
POST /api/admin/tenants  { name, slug, email, password }
    │
    ├─ 1. INSERT INTO maiai_master.tenant (→ get tenant.id)
    ├─ 2. UPDATE tenant SET databaseName = 'maiai_crm_{id}'
    ├─ 3. CREATE DATABASE maiai_crm_{id}
    ├─ 4. applyTenantMigrations(databaseName)
    │       ├─ Scan prisma/migrations_tenant/ for folders
    │       ├─ Sort by folder name (timestamp prefix)
    │       ├─ For each folder: read migration.sql → execute statements
    │       └─ Return list of applied migration names
    └─ 5. INSERT INTO maiai_master.user (admin user for this tenant)
```

The `applyTenantMigrations()` function in `tenant.controller.ts` auto-discovers all migration folders — **no code changes needed** when adding new migrations.

### Migration Directory

```
MaiAICRM/backend/prisma/migrations_tenant/
├── 20260803000100_init_crm/
│   └── migration.sql          ← 19 core business tables
└── 20260814000000_add_salonsettings/
    └── migration.sql          ← adds salonsettings table
```

Each folder must contain exactly one `migration.sql` file. Folders are sorted alphabetically (timestamp prefix ensures correct order).

### Response

```json
{
  "tenant": { "id": 9, "name": "Salon Test", "databaseName": "maiai_crm_9" },
  "admin":  { "id": 9, "email": "admin@salon-test.local", "role": "owner" },
  "migrationsApplied": 2,
  "migrations": [
    "20260803000100_init_crm",
    "20260814000000_add_salonsettings"
  ]
}
```

### Adding a New Migration

Just create a new folder with a timestamp prefix and a `migration.sql` file:

```bash
# 1. Create the migration folder
mkdir -p prisma/migrations_tenant/20260815000000_add_new_feature

# 2. Write the SQL (or generate from Prisma schema diff)
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.tenant.prisma \
  --script > prisma/migrations_tenant/20260815000000_add_new_feature/migration.sql

# 3. Test on an existing tenant
docker exec maiai-mariadb mysql -u maiai -pmaiai maiai_crm_1 \
  < prisma/migrations_tenant/20260815000000_add_new_feature/migration.sql

# 4. Rebuild — new tenants will automatically get this migration
docker compose -f docker-compose-sub.yml up -d --build maiai-backend
```

> ✅ **No controller code changes needed.** The `applyTenantMigrations()` function scans the directory at runtime.
>
> ⚠️ **Existing tenants** won't get the new migration automatically. You need a separate script to apply incremental SQL to all existing `maiai_crm_*` databases.

All endpoints require `Authorization: Bearer <token>` header.

### Tenant Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/tenants` | Create tenant + database + admin user |
| `GET` | `/api/admin/tenants` | List all tenants |
| `GET` | `/api/admin/tenants/:id` | Get tenant detail (with users) |
| `PATCH` | `/api/admin/tenants/:id` | Update tenant fields |
| `DELETE` | `/api/admin/tenants/:id` | Delete tenant + drop database |
| `GET` | `/api/admin/tenants/:id/database-info` | Get database stats (tables, sizes) |

### User Management (per Tenant)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/tenants/:id/users` | List users for a tenant |
| `POST` | `/api/admin/tenants/:id/users` | Create a new user |
| `PATCH` | `/api/admin/tenants/:id/users/:userId` | Update user (role, isActive, name, phone) |
| `DELETE` | `/api/admin/tenants/:id/users/:userId` | Delete user (prevents deleting last admin) |
| `POST` | `/api/admin/tenants/:id/users/:userId/reset-password` | Reset user password |

### CallCenterAdmin Proxy Routes

CallCenterAdmin exposes simplified routes that resolve `clientId → crmTenantId` automatically:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/clients/:id/crm-status` | Check CRM tenant status |
| `POST` | `/api/clients/:id/crm-provision` | Provision CRM tenant |
| `GET` | `/api/clients/:id/database-info` | Get database info |
| `GET` | `/api/clients/:id/crm-admin-users` | List admin users |
| `POST` | `/api/clients/:id/crm-admin-reset-password` | Reset admin password |
| `POST` | `/api/clients/:id/crm-admin-create-user` | Create admin user |
| `PATCH` | `/api/clients/:id/crm-admin-update-user/:userId` | Update admin user |
| `DELETE` | `/api/clients/:id/crm-admin-delete-user/:userId` | Delete admin user |

### POST /api/admin/tenants — Create Tenant

```bash
curl -X POST http://localhost:3001/api/admin/tenants \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Beautiful Salon",
    "slug": "beautiful-salon",
    "email": "admin@beautiful.com",
    "password": "Admin@123"
  }'
```

Response (201):
```json
{
  "tenant": { "id": 2, "name": "Beautiful Salon", "slug": "beautiful-salon", "databaseName": "maiai_crm_2" },
  "admin":  { "id": 2, "email": "admin@beautiful.com", "role": "owner" },
  "migrationsApplied": 2,
  "migrations": ["20260803000100_init_crm", "20260814000000_add_salonsettings"]
}
```

This endpoint will:
1. Create tenant record in `maiai_master`
2. Create database `maiai_crm_2`
3. Auto-discover and apply all migrations from `prisma/migrations_tenant/` in order
4. Create admin user with the given email/password

### GET /api/admin/tenants/:id/database-info — Database Stats

```bash
curl http://localhost:3001/api/admin/tenants/4/database-info \
  -H "Authorization: Bearer $TOKEN"
```

Response (200):
```json
{
  "ok": true,
  "database": {
    "name": "maiai_crm_4",
    "host": "mariadb-crm",
    "port": 3306,
    "version": "11.8.5-MariaDB",
    "totalSize": 950272,
    "isSslActive": true
  },
  "tables": [
    { "name": "guest", "rowCount": 120, "dataSize": 16384, "indexSize": 32768, "totalSize": 49152, "lastUpdated": "..." },
    ...
  ]
}
```

> **Note:** MariaDB `SUM()` returns BigInt — the controller converts via `Number()` before JSON serialization.

### GET /api/admin/tenants/:id/users — List Users

```bash
curl http://localhost:3001/api/admin/tenants/1/users \
  -H "Authorization: Bearer $TOKEN"
```

Response (200):
```json
{
  "ok": true,
  "users": [
    {
      "id": 1,
      "email": "admin@salon-test.local",
      "name": "Salon Test",
      "role": "admin",
      "isActive": true,
      "phone": null,
      "avatarUrl": null,
      "lastLoginAt": "2026-08-15T10:30:00.000Z",
      "createdAt": "2026-08-03T12:00:00.000Z"
    }
  ]
}
```

### POST /api/admin/tenants/:id/users — Create User

```bash
curl -X POST http://localhost:3001/api/admin/tenants/1/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@salon.com",
    "password": "Staff@123",
    "name": "Nguyen Van A",
    "role": "staff",
    "phone": "0901234567"
  }'
```

Roles: `admin`, `manager`, `staff`. Max users per tenant is `tenant.maxUsers` (default: 5).

### POST /api/admin/tenants/:id/users/:userId/reset-password — Reset Password

```bash
curl -X POST http://localhost:3001/api/admin/tenants/1/users/2/reset-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "password": "NewPass@123" }'
```

If `password` is omitted, defaults to `Admin@123`.

### PATCH /api/admin/tenants/:id/users/:userId — Update User

```bash
curl -X PATCH http://localhost:3001/api/admin/tenants/1/users/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "role": "manager", "isActive": true }'
```

### DELETE /api/admin/tenants/:id/users/:userId — Delete User

```bash
curl -X DELETE http://localhost:3001/api/admin/tenants/1/users/2 \
  -H "Authorization: Bearer $TOKEN"
```

> ⚠️ Cannot delete the last `admin` user of a tenant.

## 📚 File Structure

```
MaiAICRM/backend/
├── prisma/
│   ├── schema.master.prisma          # Master schema (tenant, user)
│   ├── schema.tenant.prisma          # Tenant schema (19 business models)
│   ├── migrations/                   # Master DB migrations (Prisma Migrate)
│   │   ├── 20260804000000_init_master/
│   │   ├── 20260812093000_seed_staff_and_schedule/
│   │   └── 20260812123000_seed_revenue_settings/
│   ├── migrations_tenant/            # Tenant migrations (raw SQL, auto-discovered)
│   │   ├── 20260803000100_init_crm/
│   │   │   └── migration.sql
│   │   └── 20260814000000_add_salonsettings/
│   │       └── migration.sql
│   └── migrations_old/               # Deprecated (was used before migrations_tenant/)
│       └── 20260803000100_init_crm/
│
├── src/
│   ├── generated/
│   │   ├── prisma-master/            # Generated client for master DB
│   │   └── prisma-tenant/            # Generated client for tenant DBs
│   │
│   ├── lib/
│   │   ├── prisma-master.ts          # Master DB singleton
│   │   ├── prisma-tenant.ts          # Tenant DB client factory (cached)
│   │   ├── tenant-management.ts      # Tenant provisioning helper
│   │   └── prisma.ts                 # Compat shim → re-exports tenant client
│   │
│   ├── middleware/
│   │   └── auth.middleware.ts        # JWT → resolve tenant → attach req.tenantClient
│   │
│   ├── controllers/
│   │   ├── tenant.controller.ts      # CRUD + database-info + applyTenantMigrations()
│   │   ├── auth.controller.ts        # Login (returns JWT with tenantId)
│   │   ├── calendar.controller.ts    # Appointments
│   │   ├── crm.controller.ts         # Guest management
│   │   ├── staff.controller.ts       # Staff management
│   │   └── revenue.controller.ts     # Revenue settings
│   │
│   ├── routes/
│   │   ├── tenant-admin.route.ts    # /api/admin/tenants/* (CRUD + user mgmt)
│   │   ├── auth.route.ts            # /api/auth/*
│   │   ├── calendar.route.ts        # /api/calendar/*
│   │   ├── crm.route.ts             # /api/crm/*
│   │   ├── staff.route.ts           # /api/staff/*
│   │   └── revenue.route.ts         # /api/revenue/*
│   │
│   ├── models/                       # Business logic / Prisma queries
│   │   ├── calendar.model.ts
│   │   ├── crm.model.ts
│   │   ├── staff.model.ts
│   │   └── revenue.model.ts
│   │
│   ├── scripts/
│   │   └── setup-multi-tenant.ts     # Initial setup script (standalone)
│   │
│   ├── types/
│   │   ├── express.d.ts              # Augments Express Request with tenant/user
│   │   └── tenant.ts                 # JwtPayload, TenantContext types
│   │
│   └── server.ts                     # Express app entry point
│
├── Dockerfile                        # Multi-stage build (deps → build → runtime)
├── package.json
└── prisma.config.ts                  # DATABASE_URL_MASTER override
```

## 🐛 Troubleshooting

### Q: Login fails with "Invalid credentials"

**A:** Check if:
1. Master database exists: `docker exec maiai-mariadb mysql -u maiai -pmaiai -e "USE maiai_master;"`
2. Tenant database exists: `docker exec maiai-mariadb mysql -u maiai -pmaiai -e "USE maiai_crm_1;"`
3. Admin user exists: `SELECT id, email, tenantId, role FROM maiai_master.user;`
4. User's tenant is active: `SELECT id, name, isActive FROM maiai_master.tenant WHERE id=1;`

### Q: "Unauthorized" after login on protected routes

**A:** Ensure:
1. JWT secret matches (`JWT_SECRET` env var)
2. Token payload includes `tenantId`
3. Tenant exists in master DB and `isActive = true`
4. Tenant's database exists and is accessible from the backend container

### Q: Prisma client generation fails

```bash
rm -rf backend/src/generated/
npm run prisma:generate
```

### Q: "Too many database connections"

Tenant clients are cached in memory. To clear:
```typescript
import { disconnectAllTenants } from "./lib/prisma-tenant";
await disconnectAllTenants();
```

### Q: Container keeps restarting with "P3009 migrate failed"

The DB has a failed migration record. Fix:

```sql
-- Connect to maiai-mariadb and clean up
DELETE FROM maiai_master._prisma_migrations
WHERE finished_at IS NULL AND rolled_back_at IS NULL;
```

Or mark an already-applied migration:
```bash
docker run --rm --network aicallbot_shared-net -v "$(pwd)/MaiAICRM/backend:/app" -w /app \
  -e DATABASE_URL_MASTER="mysql://maiai:maiai@maiai-mariadb:3306/maiai_master" \
  node:22-bookworm-slim bash -c \
  "npx prisma migrate resolve --applied <migration_name> --schema ./prisma/schema.master.prisma --config ./prisma.config.ts"
```

### Q: Dockerfile CMD fails on migration but server still starts

The Dockerfile uses `|| echo 'skip'` so the server starts even if `prisma migrate deploy` encounters errors (e.g., table already exists). This is intentional — migrations are applied once during initial setup, not on every container restart.

### Q: database-info returns "Cannot mix BigInt and other types"

MariaDB `SUM(DATA_LENGTH + INDEX_LENGTH)` returns BigInt. The controller wraps all SQL aggregate results with `Number()` before JSON serialization. If you see this error, ensure you're running the latest build:

```bash
docker compose -f docker-compose-sub.yml up -d --build maiai-backend
```

## 🚨 Production Considerations

1. **JWT_SECRET**: Change `maiai-jwt-secret-change-in-production` to a secure random string
2. **Database Credentials**: Use strong passwords, rotate regularly
3. **Connection Pooling**: Use MariaDB Proxy or connection limits per tenant
4. **Backups**: `mysqldump` per database — easy since each tenant is isolated
5. **Migrations**: Test on staging first; `prisma migrate deploy` is idempotent for applied migrations
6. **Monitoring**: Track connection count per tenant DB, slow query logs
7. **Schema Changes**: Run `prisma migrate dev` locally, deploy SQL via `prisma migrate deploy` in CI/CD

## 📖 References

- [Prisma Multi-Database](https://www.prisma.io/docs/guides/tutorials/multi-tenant-shadow-db-mysql)
- [Prisma Migrate Deploy](https://www.prisma.io/docs/orm/prisma-migrate/mental-models/the-prisma-cli#prisma-migrate-deploy)
- [MariaDB Information Schema](https://mariadb.com/kb/en/information-schema-tables/)

## ✅ Checklist

- [ ] MariaDB (maiai-mariadb) running on port 3307
- [ ] `maiai_master` database created with `tenant` + `user` tables
- [ ] Default tenant (`maiai_crm_1`) provisioned with 19 tables
- [ ] `prisma/migrations_tenant/` contains all migration folders with `migration.sql`
- [ ] `applyTenantMigrations()` auto-discovers migrations at runtime
- [ ] Admin user `admin@maiai.com` created
- [ ] MaiAICRM backend starts on port 3001
- [ ] Login returns JWT with `tenantId`
- [ ] `POST /api/admin/tenants` creates new tenant + database + all migrations
- [ ] `GET /api/admin/tenants/:id/database-info` returns table stats
- [ ] CallCenterAdmin CRM provisioning creates new tenants via proxy
- [ ] Frontend loads at port 3000

## 🎉 You're Ready!

Each tenant has its own database with 19 isolated business tables. All queries are automatically scoped to the authenticated tenant via `req.tenantClient`.

For integration with CallCenterAdmin, see the CRM Tenant Provisioning flow in the workspace docs.
