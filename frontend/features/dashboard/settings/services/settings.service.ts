import { apiClient } from "@/core/config/axios.config";

export type DayHours = { day: string; open: boolean; from: string; to: string };
type ApiResponse<T> = { success: boolean; data: T };

export type SalonSettings = {
  salonName: string;
  businessType: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
};

export type SystemLogItem = {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  performedBy: string;
  ipAddress: string | null;
  requestBody: string | null;
  method: string | null;
  path: string | null;
  statusCode: number | null;
  durationMs: number | null;
  success: boolean | null;
  createdAt: string;
};

export type SystemLogsQuery = {
  page?: number;
  pageSize?: number;
  entityType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
};

export type SystemLogsResponse = {
  data: SystemLogItem[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
};

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
  async getSystemLogs(params?: SystemLogsQuery): Promise<SystemLogsResponse> {
    const res = await apiClient.get<{ success: boolean } & SystemLogsResponse>(
      "/settings/system-logs",
      { params },
    );
    return { data: res.data.data, pagination: res.data.pagination };
  },
  async listUsers(): Promise<TeamUser[]> {
    const res = await apiClient.get<ApiResponse<TeamUser[]>>("/settings/users");
    return res.data.data;
  },
  async createUser(input: CreateUserInput): Promise<TeamUser> {
    const res = await apiClient.post<ApiResponse<TeamUser>>(
      "/settings/users",
      input,
    );
    return res.data.data;
  },
  async updateUser(
    id: number,
    input: Partial<CreateUserInput> & { isActive?: boolean },
  ): Promise<TeamUser> {
    const res = await apiClient.put<ApiResponse<TeamUser>>(
      `/settings/users/${id}`,
      input,
    );
    return res.data.data;
  },
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/settings/users/${id}`);
  },
};

export type TeamUser = {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  phone: string | null;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string | null;
};

export type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
};
