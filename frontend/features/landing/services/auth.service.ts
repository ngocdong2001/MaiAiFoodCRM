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
  tenant?: AuthTenant;
};

export const authService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    if (data?.token) {
      useAuthStore.getState().setSession(data.token, data.user, data.tenant ?? null);
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
    } catch (err: unknown) {
      // Only invalidate session on explicit 401 Unauthorized
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) this.logout();
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
    return useAuthStore.getState().tenant;
  },

  logout() {
    useAuthStore.getState().logout();
  },

  refreshCurrentUser() {
    return this.getCurrentUser();
  },
};
