// Single source of truth for user roles and their permission levels.
// Roles are stored as free-form strings in the master `user` table; keep
// these values in sync with seed.ts and tenant-admin.route.ts.

export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Higher index = more privileges. Used for "at least this role" checks.
const ROLE_LEVEL: Record<Role, number> = {
  staff: 1,
  admin: 2,
};

export const isRole = (value: unknown): value is Role =>
  typeof value === "string" && value in ROLE_LEVEL;

/** True when `role` has at least the privileges of `required`. */
export const hasRole = (role: unknown, required: Role): boolean =>
  isRole(role) && ROLE_LEVEL[role] >= ROLE_LEVEL[required];

// Roles allowed to perform mutating/administrative actions.
export const MANAGEMENT_ROLES: Role[] = [ROLES.ADMIN];
