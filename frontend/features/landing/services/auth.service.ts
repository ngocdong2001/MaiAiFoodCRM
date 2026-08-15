import { apiClient } from "@/core/config/axios.config";
import { useAuthStore, type AuthUser, type AuthTenant } from "@/core/store/authStore";

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
      const { data } = await apiClient.get<{ user: AuthUser; tenant: AuthTenant }>("/auth/me");

      useAuthStore.getState().setUser(data.user);
      if (data.tenant) {
        useAuthStore.getState().setTenant(data.tenant);
      }
      return data.user;
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
    return useAuthStore.getState().tenant;
  },

  logout() {
    useAuthStore.getState().logout();
  },

  refreshCurrentUser() { return this.getCurrentUser(); },
};
