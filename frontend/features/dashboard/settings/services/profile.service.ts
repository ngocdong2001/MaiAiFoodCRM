import { apiClient } from "@/core/config/axios.config";
import type { AuthUser } from "@/core/store/authStore";

export type ProfileInput = {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
};

export const profileService = {
  async update(input: ProfileInput) {
    const response = await apiClient.patch<{ user: AuthUser }>("/auth/me", input);
    return response.data.user;
  },
};