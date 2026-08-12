import { apiClient } from "@/core/config/axios.config";

import type { ApiAppointment, CalendarOptions } from "../types/calendar.types";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export const calendarService = {
  async getOptions() {
    const response = await apiClient.get<ApiResponse<CalendarOptions>>("/calendar/options");
    return response.data.data;
  },
  async getAppointments(params: { startDate: string; endDate: string; staffIds?: string }) {
    const response = await apiClient.get<ApiResponse<ApiAppointment[]>>("/calendar/appointments", { params });
    return response.data.data;
  },
  async create(input: { guestId: number; staffId: number; startTime: string; endTime: string; serviceIds: number[]; status?: string; priority?: string; notes?: string }) {
    const response = await apiClient.post<ApiResponse<ApiAppointment>>("/calendar/appointments", input);
    return response.data.data;
  },
  async update(id: number, input: { guestId: number; staffId: number; startTime: string; endTime: string; serviceIds: number[]; status?: string; priority?: string; notes?: string }) {
    const response = await apiClient.put<ApiResponse<ApiAppointment>>(`/calendar/appointments/${id}`, input);
    return response.data.data;
  },
  async updateStatus(id: number, status: string, cancelReason?: string) {
    const response = await apiClient.patch<ApiResponse<ApiAppointment>>(`/calendar/appointments/${id}/status`, { status, cancelReason });
    return response.data.data;
  },
  async delete(id: number) {
    await apiClient.delete(`/calendar/appointments/${id}`);
  },
};