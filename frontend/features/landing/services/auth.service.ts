import { apiClient } from "@/core/config/axios.config";
import { useAuthStore, type AuthUser } from "@/core/store/authStore";
import { useSalonStore, type CachedSalonSettings } from "@/core/store/salonStore";

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

type SalonApiResponse = {
  success: boolean;
  data: CachedSalonSettings;
};

export const authService = {
  async login(email: string, password: string, remember: boolean) {
    const { data } = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    });

    if (data?.token) {
      useAuthStore
        .getState()
        .setSession(data.token, data.user, data.tenant ?? null, remember);

      // After successful login, fetch salon settings and cache them
      // so next visit the UI is instantly populated.
      this.fetchAndCacheSalonProfile();
    }

    return data;
  },

  /**
   * Fetch salon business profile from the API and persist it to localStorage.
   * Runs silently after login – errors are swallowed so the login flow is
   * never blocked by a settings fetch failure.
   */
  async fetchAndCacheSalonProfile(): Promise<CachedSalonSettings | null> {
    try {
      const { data } = await apiClient.get<SalonApiResponse>("/settings/salon");
      if (data?.success && data.data) {
        useSalonStore.getState().cacheSalonProfile(data.data);
        return data.data;
      }
    } catch {
      /* settings fetch is non-critical after login */
    }
    return null;
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
