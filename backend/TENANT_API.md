# Tenant Provisioning API

> REST API để quản lý multi-tenant trên MaiAI CRM.
> Mỗi tenant có database riêng (Database-per-Tenant pattern).

---

## Mục lục

- [Cấu trúc tổng quan](#cấu-trúc-tổng-quan)
- [Xác thực](#xác-thực)
- [API Endpoints](#api-endpoints)
  - [POST /api/admin/tenants — Tạo tenant mới](#post-apitenants--tạo-tenant-mới)
  - [GET /api/admin/tenants — Danh sách tenant](#get-apitenants--danh-sách-tenant)
  - [GET /api/admin/tenants/:id — Chi tiết tenant](#get-apitenantsid--chi-tiết-tenant)
  - [PATCH /api/admin/tenants/:id — Cập nhật tenant](#patch-apitenantsid--cập-nhật-tenant)
  - [DELETE /api/admin/tenants/:id — Xóa tenant](#delete-apitenantsid--xóa-tenant)
- [Ví dụ sử dụng](#ví-dụ-sử-dụng)
- [Quy trình tạo tenant mới](#quy-trình-tạo-tenant-mới)
- [Troubleshooting](#troubleshooting)

---

## Cấu trúc tổng quan

```
maiai_master (database chung)
├── tenant          → registry tất cả tenants
└── user            → admin users cho mỗi tenant

maiai_crm_{id} (database riêng cho mỗi tenant)
├── guest, appointment, staff, service, payment ...
└── 20 business tables
```

Khi tạo tenant mới qua API, hệ thống tự động:
1. Tạo record trong bảng `tenant`
2. Tạo database `maiai_crm_{id}`
3. Chạy migration (20 business tables)
4. Tạo admin user cho tenant

---

## Xác thực

Tất cả endpoints đều yêu cầu JWT token trong header:

```
Authorization: Bearer <token>
```

Lấy token qua `POST /api/auth/login`:

```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@maiai.com", "password": "Admin@123"}'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "tenantId": 1,
    "name": "Admin User",
    "email": "admin@maiai.com",
    "role": "owner"
  },
  "tenant": {
    "id": 1,
    "name": "MaiAI Default Salon",
    "slug": "maiai-default"
  }
}
```

---

## API Endpoints

Base URL: `http://localhost:3002/api/admin/tenants`

| Method   | Endpoint            | Mô tả                    |
| -------- | ------------------- | ------------------------ |
| `POST`   | `/api/admin/tenants`       | Tạo tenant mới          |
| `GET`    | `/api/admin/tenants`       | Danh sách tất cả tenant |
| `GET`    | `/api/admin/tenants/:id`   | Chi tiết 1 tenant       |
| `PATCH`  | `/api/admin/tenants/:id`   | Cập nhật tenant         |
| `DELETE` | `/api/admin/tenants/:id`   | Xóa tenant              |

---

### POST /api/admin/tenants — Tạo tenant mới

Tạo một tenant hoàn chỉnh: database, schema, và admin user.

#### Request Body

| Field         | Type     | Required | Mô tả                          | Ví dụ                   |
| ------------- | -------- | -------- | ------------------------------- | ----------------------- |
| `name`        | `string` | ✅       | Tên salon/tenant                | `"Growth Beauty Salon"` |
| `slug`        | `string` | ✅       | Mã định danh (unique, kebab-case) | `"growth-beauty"`    |
| `email`       | `string` | ✅       | Email admin của tenant          | `"admin@growth.com"`   |
| `password`    | `string` | ✅       | Mật khẩu admin                 | `"Admin@123"`          |
| `description` | `string` | ❌       | Mô tả tenant                   | `"Premium salon"`      |
| `tier`        | `string` | ❌       | Gói dịch vụ (default: `basic`) | `"premium"`            |

#### Ví dụ Request

```bash
curl -X POST http://localhost:3002/api/admin/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Growth Beauty Salon",
    "slug": "growth-beauty",
    "email": "admin@growthbeauty.com",
    "password": "Admin@123",
    "description": "Premium beauty salon",
    "tier": "premium"
  }'
```

#### Response — 201 Created

```json
{
  "tenant": {
    "id": 2,
    "name": "Growth Beauty Salon",
    "slug": "growth-beauty",
    "databaseName": "maiai_crm_2"
  },
  "admin": {
    "id": 2,
    "email": "admin@growthbeauty.com",
    "name": "Growth Beauty Salon Admin",
    "role": "owner"
  }
}
```

#### Lỗi

| Status | Message                       | Nguyên nhân          |
| ------ | ----------------------------- | -------------------- |
| `400`  | `Missing required fields`     | Thiếu field bắt buộc |
| `409`  | `Slug already exists`         | Slug trùng lặp       |
| `500`  | `Internal server error`       | Lỗi server           |

---

### GET /api/admin/tenants — Danh sách tenant

Lấy danh sách tất cả tenants kèm thông tin users.

#### Ví dụ Request

```bash
curl http://localhost:3002/api/admin/tenants \
  -H "Authorization: Bearer <token>"
```

#### Response — 200 OK

```json
{
  "tenants": [
    {
      "id": 1,
      "slug": "maiai-default",
      "name": "MaiAI Default Salon",
      "description": null,
      "logoUrl": null,
      "databaseName": "maiai_crm_1",
      "tier": "basic",
      "maxUsers": 5,
      "maxGuests": 1000,
      "isActive": true,
      "createdAt": "2026-08-12T03:30:53.604Z",
      "updatedAt": "2026-08-12T03:30:53.473Z",
      "users": [
        {
          "id": 1,
          "email": "admin@maiai.com",
          "name": "Admin User",
          "role": "owner"
        }
      ]
    },
    {
      "id": 2,
      "slug": "growth-beauty",
      "name": "Growth Beauty Salon",
      "description": "Premium beauty salon",
      "logoUrl": null,
      "databaseName": "maiai_crm_2",
      "tier": "premium",
      "maxUsers": 5,
      "maxGuests": 1000,
      "isActive": true,
      "createdAt": "2026-08-12T03:44:27.469Z",
      "updatedAt": "2026-08-12T03:44:27.459Z",
      "users": [
        {
          "id": 2,
          "email": "admin@growthbeauty.com",
          "name": "Growth Beauty Salon Admin",
          "role": "owner"
        }
      ]
    }
  ]
}
```

---

### GET /api/admin/tenants/:id — Chi tiết tenant

Lấy thông tin chi tiết 1 tenant kèm danh sách users.

#### Ví dụ Request

```bash
curl http://localhost:3002/api/admin/tenants/2 \
  -H "Authorization: Bearer <token>"
```

#### Response — 200 OK

```json
{
  "tenant": {
    "id": 2,
    "slug": "growth-beauty",
    "name": "Growth Beauty Salon",
    "description": "Premium beauty salon",
    "databaseName": "maiai_crm_2",
    "tier": "premium",
    "maxUsers": 5,
    "maxGuests": 1000,
    "isActive": true,
    "users": [
      {
        "id": 2,
        "email": "admin@growthbeauty.com",
        "name": "Growth Beauty Salon Admin",
        "role": "owner",
        "isActive": true
      }
    ]
  }
}
```

#### Lỗi

| Status | Message          |
| ------ | ---------------- |
| `404`  | `Tenant not found` |

---

### PATCH /api/admin/tenants/:id — Cập nhật tenant

Cập nhật thông tin tenant. Chỉ gửi các field cần thay đổi.

#### Request Body

| Field        | Type      | Ví dụ        |
| ------------ | --------- | ------------ |
| `name`       | `string`  | `"New Name"` |
| `description`| `string`  | `"Updated"`  |
| `tier`       | `string`  | `"enterprise"` |
| `isActive`   | `boolean` | `false`      |
| `maxUsers`   | `number`  | `10`         |
| `maxGuests`  | `number`  | `5000`       |

#### Ví dụ Request

```bash
curl -X PATCH http://localhost:3002/api/admin/tenants/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "tier": "enterprise",
    "maxUsers": 10,
    "maxGuests": 5000
  }'
```

#### Response — 200 OK

```json
{
  "tenant": {
    "id": 2,
    "slug": "growth-beauty",
    "name": "Growth Beauty Salon",
    "tier": "enterprise",
    "maxUsers": 10,
    "maxGuests": 5000,
    "isActive": true,
    "updatedAt": "2026-08-12T04:00:00.000Z"
  }
}
```

---

### DELETE /api/admin/tenants/:id — Xóa tenant

Xóa vĩnh viễn tenant, database, và tất cả dữ liệu liên quan.

#### Ví dụ Request

```bash
curl -X DELETE http://localhost:3002/api/admin/tenants/2 \
  -H "Authorization: Bearer <token>"
```

#### Response — 200 OK

```json
{
  "message": "Tenant \"Growth Beauty Salon\" deleted",
  "databaseDropped": "maiai_crm_2"
}
```

> ⚠️ **Cảnh báo:** Hành động này không thể hoàn tác. Database `maiai_crm_2` sẽ bị DROP.

---

## Ví dụ sử dụng

### PowerShell

```powershell
# 1. Login lấy token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@maiai.com","password":"Admin@123"}'

$token = $loginResponse.token

# 2. Tạo tenant mới
$newTenant = @{
    name        = "Growth Beauty Salon"
    slug        = "growth-beauty"
    email       = "admin@growthbeauty.com"
    password    = "Admin@123"
    description = "Premium beauty salon"
    tier        = "premium"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "http://localhost:3002/api/admin/tenants" `
  -Method POST `
  -ContentType "application/json" `
  -Body $newTenant `
  -Headers @{ Authorization = "Bearer $token" }

Write-Host "Created tenant: $($result.tenant.name) (ID: $($result.tenant.id))"
Write-Host "Admin login: $($result.admin.email)"

# 3. Login với tenant mới
$tenantLogin = Invoke-RestMethod -Uri "http://localhost:3002/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@growthbeauty.com","password":"Admin@123"}'

Write-Host "Tenant JWT tenantId: $($tenantLogin.user.tenantId)"
```

### cURL

```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@maiai.com","password":"Admin@123"}' | jq -r '.token')

# Tạo tenant
curl -X POST http://localhost:3002/api/admin/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Growth Beauty Salon",
    "slug": "growth-beauty",
    "email": "admin@growthbeauty.com",
    "password": "Admin@123",
    "tier": "premium"
  }'

# Liệt kê tenants
curl http://localhost:3002/api/admin/tenants \
  -H "Authorization: Bearer $TOKEN"
```

---

## Quy trình tạo tenant mới

```
POST /api/admin/tenants
         │
         ▼
┌─────────────────────┐
│ 1. Validate input   │
│    - name, slug,     │
│      email, password │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 2. Tạo tenant record│  → INSERT INTO maiai_master.tenant
│    (lấy auto ID)    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 3. Tạo database     │  → CREATE DATABASE maiai_crm_{id}
│    UTF8MB4           │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 4. Chạy migration   │  → 20 business tables:
│    tenant schema     │     guest, appointment, staff,
│                     │     service, payment, etc.
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 5. Tạo admin user   │  → INSERT INTO maiai_master.user
│    bcrypt password   │     role = "owner"
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 6. Return response  │  → tenant info + admin info
└─────────────────────┘
```

---

## Quy tắc đặt tên

| Field     | Quy tắc                          | Ví dụ                 |
| --------- | -------------------------------- | --------------------- |
| `name`    | Tên tự do                        | `"Growth Beauty Salon"` |
| `slug`    | kebab-case, unique, `[a-z0-9-]` | `"growth-beauty"`     |
| `email`   | Email hợp lệ, unique             | `"admin@growth.com"`  |
| `tier`    | `basic`, `premium`, `enterprise` | `"premium"`           |

Database name tự động: `maiai_crm_{id}` (ví dụ: `maiai_crm_2`)

---

## Tech Stack

| Thành phần        | Phiên bản     |
| ----------------- | ------------- |
| Runtime           | Node.js 24    |
| Framework         | Express 4     |
| ORM               | Prisma 7.9.1  |
| Database          | MariaDB 12.3  |
| Driver Adapter    | @prisma/adapter-mariadb |
| Auth              | JWT + bcryptjs |
| Module System     | ESM           |

---

## Database Schema

### Bảng `tenant` (maiai_master)

| Column        | Type         | Mô tả                  |
| ------------- | ------------ | ---------------------- |
| `id`          | `INT` (PK)   | Auto-increment         |
| `slug`        | `VARCHAR(100)` | Unique slug          |
| `name`        | `VARCHAR(255)` | Tên tenant           |
| `description` | `TEXT`       | Mô tả (nullable)      |
| `logoUrl`     | `VARCHAR(500)` | Logo URL (nullable)  |
| `databaseName`| `VARCHAR(100)` | Tên database (unique)|
| `tier`        | `VARCHAR(20)`  | Gói dịch vụ          |
| `maxUsers`    | `INT`        | Số user tối đa        |
| `maxGuests`   | `INT`        | Số guest tối đa       |
| `isActive`    | `BOOLEAN`    | Kích hoạt             |
| `createdAt`   | `DATETIME(3)`| Thời gian tạo         |
| `updatedAt`   | `DATETIME(3)`| Thời gian cập nhật    |

### Bảng `user` (maiai_master)

| Column         | Type           | Mô tả               |
| -------------- | -------------- | ------------------- |
| `id`           | `INT` (PK)     | Auto-increment      |
| `tenantId`     | `INT` (FK)     | Liên kết tenant     |
| `email`        | `VARCHAR(255)` | Email (unique)      |
| `passwordHash` | `VARCHAR(255)` | bcrypt hash         |
| `name`         | `VARCHAR(255)` | Họ tên              |
| `role`         | `VARCHAR(30)`  | owner/admin/staff   |
| `isActive`     | `BOOLEAN`      | Kích hoạt           |
| `phone`        | `VARCHAR(20)`  | Số điện thoại       |
| `avatarUrl`    | `VARCHAR(500)` | URL avatar          |
| `lastLoginAt`  | `DATETIME(3)`  | Lần đăng nhập cuối |
| `createdAt`    | `DATETIME(3)`  | Thời gian tạo      |
| `updatedAt`    | `DATETIME(3)`  | Thời gian cập nhật |

---

## Troubleshooting

### Lỗi `Access denied for user 'maiai'`

```bash
# Cấp quyền cho user maiai
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'maiai'@'127.0.0.1' WITH GRANT OPTION; FLUSH PRIVILEGES;"
```

### Lỗi `Slug already exists`

Slug đã được sử dụng. Chọn slug khác hoặc xóa tenant cũ trước.

### Lỗi `Migration file not found`

Kiểm tra file `prisma/migrations_tenant/20260803000100_init_crm/migration.sql` tồn tại.

### Kiểm tra database đã được tạo

```sql
-- Kết nối MariaDB
mysql -u root

-- Liệt kê databases
SHOW DATABASES;

-- Kiểm tra tables trong tenant database
SHOW TABLES FROM maiai_crm_2;
```

### Kiểm tra tenant record

```sql
USE maiai_master;
SELECT id, slug, name, databaseName, isActive FROM tenant;
SELECT id, tenantId, email, role FROM user;
```
