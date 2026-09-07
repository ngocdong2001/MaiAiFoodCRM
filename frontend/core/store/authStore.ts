"use client";

import { create } from "zustand";

export const AUTH_TOKEN_KEY = "maiai-auth-token";
export const AUTH_USER_KEY = "maiai-auth-user";
export const AUTH_TENANT_KEY = "maiai-auth-tenant";
export const AUTH_REMEMBER_KEY = "maiai-auth-remember";

export type AuthUser = {
  id: number;
  tenantId: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  avatarUrl?: string | null;
};

export type AuthTenant = {
  id: number;
  name: string;
  slug: string;
  databaseName?: string;
};

type AuthState = {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  token: string | null;
  remember: boolean;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (
    token: string,
    user: AuthUser,
    tenant: AuthTenant | null,
    remember: boolean,
  ) => void;
  setUser: (user: AuthUser) => void;
  setTenant: (tenant: AuthTenant) => void;
  logout: () => void;
};

/**
 * Persist the session either permanently (localStorage) when "remember me"
 * is checked, or only for the current tab (sessionStorage) otherwise.
 */
const getStorage = () => {
  const remember =
    typeof window !== "undefined" &&
    (sessionStorage.getItem(AUTH_REMEMBER_KEY) ??
      localStorage.getItem(AUTH_REMEMBER_KEY)) === "true";
  return remember ? localStorage : sessionStorage;
};

const write = (key: string, value: string) => {
  const storage = getStorage();
  storage.setItem(key, value);
};

const read = (key: string) => {
  if (typeof window === "undefined") return null;
  // Prefer the target storage, but fall back across both so an already
  // persisted session is never lost during a storage-type transition.
  return (
    getStorage().getItem(key) ??
    localStorage.getItem(key) ??
    sessionStorage.getItem(key)
  );
};

const remove = (key: string) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

const writeUser = (user: AuthUser) => write(AUTH_USER_KEY, JSON.stringify(user));
const writeTenant = (tenant: AuthTenant | null) => {
  if (tenant) {
    write(AUTH_TENANT_KEY, JSON.stringify(tenant));
  } else {
    remove(AUTH_TENANT_KEY);
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenant: null,
  token: null,
  remember: false,
  hydrated: false,
  hydrate: () => {
    const token = read(AUTH_TOKEN_KEY);
    const storedUser = read(AUTH_USER_KEY);
    const storedTenant = read(AUTH_TENANT_KEY);
    let user: AuthUser | null = null;
    let tenant: AuthTenant | null = null;
    if (storedUser) {
      try { user = JSON.parse(storedUser) as AuthUser; } catch { remove(AUTH_USER_KEY); }
    }
    if (storedTenant) {
      try { tenant = JSON.parse(storedTenant) as AuthTenant; } catch { remove(AUTH_TENANT_KEY); }
    }
    const remember =
      (sessionStorage.getItem(AUTH_REMEMBER_KEY) ??
        localStorage.getItem(AUTH_REMEMBER_KEY)) === "true";
    set({ token, user, tenant, remember, hydrated: true });
  },
  setSession: (token, user, tenant, remember) => {
    // Persist the remember preference first so getStorage() resolves correctly.
    if (remember) {
      localStorage.setItem(AUTH_REMEMBER_KEY, "true");
      sessionStorage.removeItem(AUTH_REMEMBER_KEY);
    } else {
      sessionStorage.setItem(AUTH_REMEMBER_KEY, "false");
      localStorage.removeItem(AUTH_REMEMBER_KEY);
    }

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(AUTH_TOKEN_KEY, token);
    writeUser(user);
    writeTenant(tenant);
    set({ token, user, tenant, remember, hydrated: true });
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
    remove(AUTH_TOKEN_KEY);
    remove(AUTH_USER_KEY);
    remove(AUTH_TENANT_KEY);
    remove(AUTH_REMEMBER_KEY);
    set({ token: null, user: null, tenant: null, remember: false, hydrated: true });
  },
}));

export const getStoredAuthToken = () =>
  typeof window === "undefined"
    ? null
    : useAuthStore.getState().token ?? read(AUTH_TOKEN_KEY);