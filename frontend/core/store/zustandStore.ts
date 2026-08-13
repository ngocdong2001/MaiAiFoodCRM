import { create } from "zustand";

interface AuthUser {
  id: number;
  tenantId: number;
  name: string;
  email: string;
  role: string;
}

interface AuthTenant {
  id: number;
  name: string;
  slug: string;
}

interface AuthStore {
  user: AuthUser | null;
  tenant: AuthTenant | null;
  token: string | null;
  setUser: (user: AuthUser | null) => void;
  setTenant: (tenant: AuthTenant | null) => void;
  setToken: (token: string | null) => void;
  setAuth: (user: AuthUser, tenant: AuthTenant, token: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  tenant: null,
  token: null,

  setUser: (user) => set({ user }),
  setTenant: (tenant) => set({ tenant }),
  setToken: (token) => set({ token }),

  setAuth: (user, tenant, token) => {
    set({ user, tenant, token });
  },

  clearAuth: () => {
    set({ user: null, tenant: null, token: null });
  },

  isAuthenticated: () => {
    const { user, token } = get();
    return !!user && !!token;
  },
}));

// Legacy store for example (keeping for backward compatibility)
const useBear = create((set) => ({
  bears: 0,
  increasePopulation: () => set((state: any) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears: any) => set({ bears: newBears }),
}));

export default useBear;

