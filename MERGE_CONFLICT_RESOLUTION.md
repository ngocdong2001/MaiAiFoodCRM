# Merge Conflict Resolution Guide

> **Commit gốc:** `b0a666b` — *Thêm phần multi-tenant cho backend và frontend*
> **Merge commit:** `993e962` — *Merge dev/dev into Dong's-code*
> **Ngày:** 2026-08-14

---

## Tổng quan

Merge từ `dev/dev` vào `Dong's-code` đã xảy ra conflict ở **frontend auth files**.
Nguyên nhân: `dev/dev` có file `authStore.ts` mới (không có multi-tenant), trong khi
`Dong's-code` đã cập nhật `auth.service.ts` và `zustandStore.ts` để hỗ trợ multi-tenant.

---

## Các file bị ảnh hưởng

### Backend ✅ — Không có conflict

Backend code giữ nguyên từ commit `b0a666b`. Không cần thay đổi gì thêm.

| File | Trạng thái |
|------|-----------|
| `backend/src/controllers/tenant.controller.ts` | ✅ Giữ nguyên |
| `backend/src/controllers/auth.controller.ts` | ✅ Giữ nguyên |
| `backend/src/middleware/auth.middleware.ts` | ✅ Fix minor TS error |
| `backend/src/lib/prisma-master.ts` | ✅ Giữ nguyên |
| `backend/src/lib/prisma-tenant.ts` | ✅ Giữ nguyên |
| `backend/src/routes/tenant.route.ts` | ✅ Giữ nguyên |
| `backend/prisma/schema.master.prisma` | ✅ Giữ nguyên |
| `backend/prisma/schema.tenant.prisma` | ✅ Giữ nguyên |

### Frontend ⚠️ — Đã resolve conflict

| File | Hành động |
|------|-----------|
| `frontend/core/store/authStore.ts` | **Đã cập nhật** — thêm tenant support |
| `frontend/features/landing/services/auth.service.ts` | **Đã cập nhật** — import tenant types |

---

## Chi tiết thay đổi

### 1. `frontend/core/store/authStore.ts`

**Conflict:** `dev/dev` tạo file mới `authStore.ts` (không có tenant), trùng tên với logic store.

**Resolution:** Cập nhật `authStore.ts` để hỗ trợ multi-tenant:

```diff
  export const AUTH_TOKEN_KEY = "maiai-auth-token";
  export const AUTH_USER_KEY = "maiai-auth-user";
+ export const AUTH_TENANT_KEY = "maiai-auth-tenant";

  export type AuthUser = {
    id: number;
+   tenantId: number;
    name: string;
    email: string;
    role: string;
-   phone: string | null;
-   avatarUrl: string | null;
  };

+ export type AuthTenant = {
+   id: number;
+   name: string;
+   slug: string;
+ };

  type AuthState = {
    user: AuthUser | null;
+   tenant: AuthTenant | null;
    token: string | null;
    hydrated: boolean;
    hydrate: () => void;
-   setSession: (token: string, user: AuthUser) => void;
+   setSession: (token: string, user: AuthUser, tenant: AuthTenant) => void;
    setUser: (user: AuthUser) => void;
+   setTenant: (tenant: AuthTenant) => void;
    logout: () => void;
  };
```

**Thêm logic tenant:**
- `hydrate()` — restore cả `tenant` từ localStorage
- `setSession(token, user, tenant)` — lưu cả 3 vào localStorage
- `setTenant(tenant)` — cập nhật tenant
- `logout()` — xóa cả `AUTH_TENANT_KEY`

### 2. `frontend/features/landing/services/auth.service.ts`

**Conflict:** `dev/dev` version không có tenant handling.

**Resolution:** Cập nhật để import và sử dụng `AuthTenant`:

```diff
- import { useAuthStore, type AuthUser } from "@/core/store/authStore";
+ import { useAuthStore, type AuthUser, type AuthTenant } from "@/core/store/authStore";

  type LoginResponse = {
    token: string;
    user: AuthUser;
    tenant: AuthTenant;
  };

  export const authService = {
    async login(email: string, password: string) {
      const { data } = await apiClient.post<LoginResponse>("/auth/login", { email, password });
-     if (data?.token) useAuthStore.getState().setSession(data.token, data.user);
+     if (data?.token) {
+       useAuthStore.getState().setSession(data.token, data.user, data.tenant);
+     }
      return data;
    },

    async getCurrentUser() {
      // ...
      const { data } = await apiClient.get<{ user: AuthUser; tenant: AuthTenant }>("/auth/me");
      useAuthStore.getState().setUser(data.user);
+     if (data.tenant) {
+       useAuthStore.getState().setTenant(data.tenant);
+     }
      return data.user;
    },

+   getStoredTenant() {
+     return useAuthStore.getState().tenant;
+   },

    logout() {
      useAuthStore.getState().logout();
    },
  };
```

### 3. `backend/src/middleware/auth.middleware.ts`

**Không phải conflict**, nhưng fix TypeScript error từ merge:

```diff
- const payload = jwt.verify(token, jwtSecret) as JwtPayload;
+ const payload = jwt.verify(token, jwtSecret) as unknown as JwtPayload;
```

---

## Hướng dẫn cho Dev khác

### Nếu bạn ở branch `dev/dev` (hoặc branch khác không có multi-tenant)

#### Bước 1: Cập nhật `authStore.ts`

Thêm các dòng sau vào file `frontend/core/store/authStore.ts`:

```typescript
// Thêm key
export const AUTH_TENANT_KEY = "maiai-auth-tenant";

// Cập nhật AuthUser type - thêm tenantId
export type AuthUser = {
  id: number;
  tenantId: number;  // THÊM DÒNG NÀY
  name: string;
  email: string;
  role: string;
};

// Thêm AuthTenant type
export type AuthTenant = {
  id: number;
  name: string;
  slug: string;
};

// Cập nhật AuthState - thêm tenant
type AuthState = {
  user: AuthUser | null;
  tenant: AuthTenant | null;  // THÊM DÒNG NÀY
  token: string | null;
  // ... rest unchanged
  setSession: (token: string, user: AuthUser, tenant: AuthTenant) => void;  // THÊM tenant
  setTenant: (tenant: AuthTenant) => void;  // THÊM METHOD MỚI
  // ...
};
```

#### Bước 2: Cập nhật `auth.service.ts`

```typescript
// Import thêm AuthTenant
import { useAuthStore, type AuthUser, type AuthTenant } from "@/core/store/authStore";

// Trong login(), gọi setSession với tenant
useAuthStore.getState().setSession(data.token, data.user, data.tenant);

// Trong getCurrentUser(), set tenant
if (data.tenant) {
  useAuthStore.getState().setTenant(data.tenant);
}

// Thêm method mới
getStoredTenant() {
  return useAuthStore.getState().tenant;
},
```

#### Bước 3: Cập nhật `auth.middleware.ts` (Backend)

```diff
- const payload = jwt.verify(token, jwtSecret) as JwtPayload;
+ const payload = jwt.verify(token, jwtSecret) as unknown as JwtPayload;
```

---

## API Reference

### Login Response

```json
{
  "token": "eyJhbGci...",
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

### GET /api/auth/me Response

```json
{
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

### Tenant Provisioning (POST /api/admin/tenants)

```json
// Request
{
  "name": "Growth Beauty Salon",
  "slug": "growth-beauty",
  "email": "admin@growthbeauty.com",
  "password": "Admin@123",
  "tier": "premium"
}

// Response 201
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

---

## Checklist khi merge

- [ ] `authStore.ts` có `tenantId` trong `AuthUser`
- [ ] `authStore.ts` có `AuthTenant` type
- [ ] `authStore.ts` có `AUTH_TENANT_KEY`
- [ ] `authStore.ts` có `tenant` trong state
- [ ] `authStore.ts` có `setSession(token, user, tenant)`
- [ ] `authStore.ts` có `setTenant(tenant)`
- [ ] `auth.service.ts` import `AuthTenant`
- [ ] `auth.service.ts` gọi `setSession` với 3 params
- [ ] `auth.service.ts` có `getStoredTenant()`
- [ ] `auth.middleware.ts` dùng `as unknown as JwtPayload`
- [ ] Backend chạy OK: `npm run dev`
- [ ] Frontend chạy OK: `npm run dev`
- [ ] Login test: trả về `tenant` object

---

## Files tham khảo

| File | Mục đích |
|------|----------|
| `backend/TENANT_API.md` | API documentation cho Tenant Provisioning |
| `backend/MULTI_TENANT_SETUP.md` | Hướng dẫn setup multi-tenant |
| `backend/src/controllers/tenant.controller.ts` | CRUD tenant endpoints |
| `backend/src/routes/tenant.route.ts` | Route definitions |
| `frontend/core/store/authStore.ts` | Zustand store với tenant support |
| `frontend/features/landing/services/auth.service.ts` | Auth API calls |
