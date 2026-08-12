"use client";

import { create } from "zustand";

export const AUTH_TOKEN_KEY = "maiai-auth-token";
export const AUTH_USER_KEY = "maiai-auth-user";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatarUrl: string | null;
};

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (token: string, user: AuthUser) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
};

const writeUser = (user: AuthUser) => localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,
  hydrate: () => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    let user: AuthUser | null = null;
    if (storedUser) {
      try { user = JSON.parse(storedUser) as AuthUser; } catch { localStorage.removeItem(AUTH_USER_KEY); }
    }
    set({ token, user, hydrated: true });
  },
  setSession: (token, user) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    writeUser(user);
    set({ token, user, hydrated: true });
  },
  setUser: (user) => {
    writeUser(user);
    set({ user });
  },
  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    set({ token: null, user: null, hydrated: true });
  },
}));

export const getStoredAuthToken = () =>
  typeof window === "undefined" ? null : useAuthStore.getState().token ?? localStorage.getItem(AUTH_TOKEN_KEY);