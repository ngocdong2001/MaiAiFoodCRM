import { apiClient } from "@/core/config/axios.config";
import { useAuthStore, type AuthUser } from "@/core/store/authStore";

const AUTH_TOKEN_KEY = "maiai-auth-token";
const AUTH_USER_KEY = "maiai-auth-user";
const AUTH_TENANT_KEY = "maiai-auth-tenant";

type AuthTenant = {
  id: number;
  name: string;
  slug: string;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
  tenant: AuthTenant;
};

export const authService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    if (data?.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(AUTH_TENANT_KEY, JSON.stringify(data.tenant));
    }

    return data;
  },

  async getCurrentUser() {
    if (!useAuthStore.getState().token) return null;

    try {
      const { data } = await apiClient.get<{
        user: AuthUser;
        tenant: AuthTenant;
      }>("/auth/me", {
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });

      return data;
    } catch {
      this.logout();
      return null;
    }
  },

  getStoredToken() {
    return useAuthStore.getState().token;
  },

  getStoredUser() {
    return useAuthStore.getState().user;
  },

  getStoredTenant() {
    if (typeof window === "undefined") {
      return null;
    }

    const storedTenant = localStorage.getItem(AUTH_TENANT_KEY);
    if (!storedTenant) {
      return null;
    }

    try {
      return JSON.parse(storedTenant) as AuthTenant;
    } catch {
      return null;
    }
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TENANT_KEY);
    }
  },

  refreshCurrentUser() {
    return this.getCurrentUser();
  },
};
