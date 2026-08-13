# MaiAI CRM - Database-per-Tenant Setup Guide

## 🏗️ Architecture Overview

This CRM uses a **Database-per-Tenant** architecture for multi-tenancy:

```
MySQL Server (localhost:3306)
├── maiai_master (Global - Shared)
│   ├── tenant table (salon registry)
│   └── user table (users with tenantId)
│
└── maiai_crm_1 (Tenant 1 - Isolated)
    ├── guest, appointment, payment...
    └── (20 business tables)

└── maiai_crm_N (Tenant N - Isolated)
    ├── guest, appointment, payment...
    └── (20 business tables)
```

**Benefits:**
- ✅ Complete data isolation between tenants
- ✅ Independent scaling per tenant
- ✅ Easy database backup per salon
- ✅ Simple compliance & GDPR handling

## 🚀 Initial Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
npm run prisma:generate
```

### Step 2: Create Master Database & Admin User

```bash
npm run setup:multi-tenant
```

This script will:
1. Create `maiai_master` database
2. Run master migrations (tenant, user tables)
3. Create default tenant "MaiAI Default Salon"
4. Create `maiai_crm_1` database for the default tenant
5. Run tenant migrations on `maiai_crm_1`
6. Create admin user

**Default Admin Credentials:**
```
Email: admin@maiai.com
Password: Admin@123
```

### Step 3: Start Backend

```bash
npm run dev
```

### Step 4: Start Frontend (in another terminal)

```bash
cd frontend
npm run dev
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

## 👤 Adding New Tenants

### Method 1: Via Admin API (Recommended)

```bash
POST /api/admin/tenants
{
  "name": "Beautiful Salon",
  "slug": "beautiful-salon"
}
```

Response:
```json
{
  "id": 2,
  "databaseName": "maiai_crm_2",
  "slug": "beautiful-salon"
}
```

This endpoint (to be created) will:
1. Create tenant in master DB
2. Create new database `maiai_crm_2`
3. Run all migrations on new database

### Method 2: Manual (For Development)

```bash
# Create master tenant record
mysql -u maiai -p123 -h 127.0.0.1 maiai_master \
  -e "INSERT INTO tenant (name, slug, databaseName) VALUES ('New Salon', 'new-salon', 'maiai_crm_2')"

# Create database
mysql -u maiai -p123 -h 127.0.0.1 \
  -e "CREATE DATABASE maiai_crm_2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"

# Run migrations
DATABASE_URL_TENANT=mysql://maiai:123@127.0.0.1:3306/maiai_crm_2 \
npx prisma migrate deploy --schema ./prisma/schema.tenant.prisma

# Create admin user for new tenant
# (via script or API)
```

## 📚 File Structure

```
backend/
├── prisma/
│   ├── schema.master.prisma          # Master schema (tenants, users)
│   ├── schema.tenant.prisma          # Tenant schema (business models)
│   ├── migrations/
│   │   └── 20260804000000_init_master/    # Master DB migration
│   └── migrations_tenant/
│       └── 20260804000000_init_tenant/    # Tenant DB migration
│
├── src/
│   ├── lib/
│   │   ├── prisma-master.ts          # Master DB singleton
│   │   ├── prisma-tenant.ts          # Tenant DB client factory
│   │   └── tenant-management.ts      # Tenant provisioning
│   │
│   ├── middleware/
│   │   └── auth.middleware.ts        # Resolves tenant context
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts        # Login with tenantId
│   │   └── ...
│   │
│   ├── types/
│   │   └── tenant.ts                 # Type definitions
│   │
│   ├── scripts/
│   │   └── setup-multi-tenant.ts    # Initial setup script
│   │
│   └── server.ts                     # Enhanced with Prisma init
│
└── package.json                      # Multi-tenant scripts
```

## 🐛 Troubleshooting

### Q: Login fails with "Invalid credentials"

**A:** Check if:
1. Master database exists: `mysql -u maiai -p123 -h 127.0.0.1 -e "USE maiai_master;"`
2. Tenant database exists: `mysql -u maiai -p123 -h 127.0.0.1 -e "USE maiai_crm_1;"`
3. Admin user exists: `SELECT * FROM maiai_master.user;`
4. User's tenant is active: `SELECT * FROM maiai_master.tenant WHERE id=1;`

### Q: "Unauthorized" after login on protected routes

**A:** Ensure:
1. JWT secret matches between login and verification
2. Token includes tenantId
3. Tenant exists in master DB and is active
4. Tenant's database exists and is accessible

### Q: Prisma client generation fails

**A:** Run:
```bash
# Clear old clients
rm -rf backend/src/generated/

# Generate fresh clients
npm run prisma:generate
```

### Q: Too many database connections

**A:** Tenant clients are cached. To clear:
```typescript
import { disconnectAllTenants } from "@/lib/prisma-tenant";

// Call when needed
await disconnectAllTenants();
```

## 🚨 Production Considerations

1. **Database Credentials**: Use environment variables for each tenant database
2. **Connection Pooling**: Use PgBouncer or similar for production
3. **Backups**: Implement per-database backup strategy
4. **Migrations**: Test migrations on staging before production tenants
5. **Monitoring**: Monitor each tenant DB connection pool separately
6. **Scaling**: Consider database replication for large tenants

## 📖 References

- **Prisma Docs**: https://www.prisma.io/docs/
- **Multi-tenancy Guide**: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-multiple-databases
- **MySQL Docs**: https://dev.mysql.com/doc/

## ✅ Checklist

- [ ] Master database created
- [ ] Default tenant database created
- [ ] Admin user created
- [ ] Backend starts without errors
- [ ] Login works with admin credentials
- [ ] Dashboard loads after login
- [ ] API endpoints work (with Bearer token)
- [ ] Frontend stores tenant info in localStorage
- [ ] Protected routes require authentication

## 🎉 You're Ready!

Your multi-tenant CRM is now set up with database-per-tenant isolation. Each tenant has their own database and all queries are automatically scoped to their data.

For questions or issues, check the troubleshooting section above.
