// Multi-tenant types
export interface JwtPayload {
  sub: number; // user ID
  tenantId: number;
  email: string;
  role: string;
}

export interface TenantContext {
  tenantId: number;
  databaseUrl: string;
  userId: number;
  email: string;
  role: string;
}
