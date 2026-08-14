"use client";

import { create } from "zustand";

export const AUTH_TOKEN_KEY = "maiai-auth-token";
export const AUTH_USER_KEY = "maiai-auth-user";
export const AUTH_TENANT_KEY = "maiai-auth-tenant";

export type AuthUser = {
  id: number;
  tenantId: number;
  name: string;
  email: string;
  role: string;
};

export type AuthTenant = {
  id: number;
  name: string;
  slug: string;
};

type AuthState = {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  token: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (token: string, user: AuthUser, tenant: AuthTenant) => void;
  setUser: (user: AuthUser) => void;
  setTenant: (tenant: AuthTenant) => void;
  logout: () => void;
};

const writeUser = (user: AuthUser) => localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
const writeTenant = (tenant: AuthTenant) => localStorage.setItem(AUTH_TENANT_KEY, JSON.stringify(tenant));

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  token: null,
  hydrated: false,
  hydrate: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    const storedTenant = localStorage.getItem(AUTH_TENANT_KEY);
    let user: AuthUser | null = null;
    let tenant: AuthTenant | null = null;
    if (storedUser) {
      try { user = JSON.parse(storedUser) as AuthUser; } catch { localStorage.removeItem(AUTH_USER_KEY); }
    }
    if (storedTenant) {
      try { tenant = JSON.parse(storedTenant) as AuthTenant; } catch { localStorage.removeItem(AUTH_TENANT_KEY); }
    }
    set({ token, user, tenant, hydrated: true });
  },
  setSession: (token, user, tenant) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    writeUser(user);
    writeTenant(tenant);
    set({ token, user, tenant, hydrated: true });
  },
  setUser: (user) => {
    writeUser(user);
    set({ user });
  },
  setTenant: (tenant) => {
    writeTenant(tenant);
    set({ tenant });
  },
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TENANT_KEY);
    set({ token: null, user: null, tenant: null, hydrated: true });
  },
}));

export const getStoredAuthToken = () =>
  typeof window === "undefined" ? null : useAuthStore.getState().token ?? localStorage.getItem(AUTH_TOKEN_KEY);