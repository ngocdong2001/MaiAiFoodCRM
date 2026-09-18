"use client";

import { useAuthStore } from "@/core/store/authStore";

// Mirrors the backend role list. Keep in sync with backend/src/types/roles.ts.
export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

const ROLE_LEVEL: Record<string, number> = {
  staff: 1,
  admin: 2,
};

const roleLevel = (role: string | undefined): number =>
  role ? (ROLE_LEVEL[role] ?? 1) : 0;

/**
 * Permission helpers backed by the authenticated user's role.
 * Used to conditionally show/hide management UI. Note: this is a UX
 * convenience only — real enforcement happens server-side via requireRole.
 */
export const usePermission = () => {
  const role = useAuthStore((state) => state.user?.role);

  return {
    role,
    isAdmin: roleLevel(role) >= ROLE_LEVEL.admin,
    isStaff: roleLevel(role) >= ROLE_LEVEL.staff,
    /** true when the user can perform management/administrative actions. */
    canManage: roleLevel(role) >= ROLE_LEVEL.admin,
  };
};
