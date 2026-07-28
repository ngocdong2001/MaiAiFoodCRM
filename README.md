# MAIAI Landing Page

Landing page của MAIAI được xây dựng với Next.js 16, React 19, TypeScript và Tailwind CSS v4.

## Công nghệ sử dụng

- **Next.js 16** + **React 19** + **TypeScript** - Framework chính
- **Tailwind CSS v4** + **shadcn/ui** - Giao diện và component
- **Zustand** - Quản lý state
- **TanStack Query** - Fetch và cache dữ liệu
- **React Hook Form** + **Zod** - Xử lý form và validation
- **Axios** - HTTP client

## Cấu trúc dự án

```
├── app/          # Next.js App Router (routes, layouts, API)
├── core/         # Cấu hình chính (axios, providers, services, store, theme)
├── features/     # Các module theo feature (landing, ...)
├── shared/       # Components, hooks, utils dùng chung
├── assets/       # Hình ảnh, icons, fonts
└── public/       # File tĩnh
```

**Tổ chức theo features:** Mỗi feature (vd: `features/landing/`) có components, data, và logic riêng. Các tài nguyên dùng chung nằm trong `shared/`.

## Chạy dự án

```bash
# Cài đặt
npm install

# Development
npm run dev        # http://localhost:3000

# Production
npm run build
npm run start

# Lint
npm run lint
```

## Quy ước quan trọng

**Đường dẫn rút gọn:**

```typescript
"@/*": ["./*"]  // Import từ root: @/core, @/shared, @/features
```

**Giao diện:**

- Dùng các class tiện ích của Tailwind
- Biến CSS trong [app/globals.css](app/globals.css)
- Font: Onest (map `--font-onest` → `--font-sans`)

**Components:**

- TypeScript + React Function Components
- Component client: thêm `"use client"` ở đầu file
- Thiết kế Atomic: atoms → molecules → organisms

**Quản lý state:**

- Local: `useState/useReducer`
- Global: Zustand (`core/store/`)
- Server: TanStack Query
- Form: React Hook Form + Zod

**Đặt tên file:**

- Components: `PascalCase` (`HeroSection.tsx`)
- Hooks: `camelCase` với tiền tố `use` (`useInView.ts`)
- Services: `camelCase` + `.service.ts`

---

**MAIAI Team**
