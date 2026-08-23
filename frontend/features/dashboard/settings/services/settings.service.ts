import { apiClient } from "@/core/config/axios.config";

export type DayHours = { day: string; open: boolean; from: string; to: string };
type ApiResponse<T> = { success: boolean; data: T };

export type SalonSettings = { timezone: string };

export const settingsService = {
  async getOperatingHours(): Promise<DayHours[]> {
    const res = await apiClient.get<ApiResponse<DayHours[]>>(
      "/settings/operating-hours",
    );
    return res.data.data;
  },
  async updateOperatingHours(hours: DayHours[]): Promise<DayHours[]> {
    const res = await apiClient.put<ApiResponse<DayHours[]>>(
      "/settings/operating-hours",
      hours,
    );
    return res.data.data;
  },
  async getSalonSettings(): Promise<SalonSettings> {
    const res = await apiClient.get<ApiResponse<SalonSettings>>("/settings/salon");
    return res.data.data;
  },
  async updateSalonSettings(data: SalonSettings): Promise<SalonSettings> {
    const res = await apiClient.put<ApiResponse<SalonSettings>>("/settings/salon", data);
    return res.data.data;
  },
};
