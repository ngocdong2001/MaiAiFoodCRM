import { apiClient } from "@/core/config/axios.config";

const AUTH_TOKEN_KEY = "maiai-auth-token";
const AUTH_USER_KEY = "maiai-auth-user";

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

type LoginResponse = {
  token: string;
  user: AuthUser;
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
    }

    return data;
  },

  async getCurrentUser() {
    const token = this.getStoredToken();
    if (!token) {
      return null;
    }

    try {
      const { data } = await apiClient.get<{ user: AuthUser }>("/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return data.user;
    } catch {
      this.logout();
      return null;
    }
  },

  getStoredToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getStoredUser() {
    if (typeof window === "undefined") {
      return null;
    }

    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      return null;
    }
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  },
};
