import { apiClient } from "@/core/config/axios.config";

import type { ApiAppointment, CalendarOptions } from "../types/calendar.types";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

export const calendarService = {
  async getOptions() {
    const response =
      await apiClient.get<ApiResponse<CalendarOptions>>("/calendar/options");
    return response.data.data;
  },
  async getAppointments(params: {
    startDate: string;
    endDate: string;
    staffIds?: string;
  }) {
    const response = await apiClient.get<ApiResponse<ApiAppointment[]>>(
      "/calendar/appointments",
      { params },
    );
    return response.data.data;
  },
  async create(input: {
    guestId: number;
    staffId: number;
    startTime: string;
    endTime: string;
    serviceIds: number[];
    status?: string;
    priority?: string;
    source?: string;
    notes?: string;
  }) {
    const response = await apiClient.post<ApiResponse<ApiAppointment>>(
      "/calendar/appointments",
      input,
    );
    return response.data.data;
  },
  async update(
    id: number,
    input: {
      guestId: number;
      staffId: number;
      startTime: string;
      endTime: string;
      serviceIds: number[];
      status?: string;
      priority?: string;
      source?: string;
      notes?: string;
    },
  ) {
    const response = await apiClient.put<ApiResponse<ApiAppointment>>(
      `/calendar/appointments/${id}`,
      input,
    );
    return response.data.data;
  },
  async updateStatus(id: number, status: string, cancelReason?: string) {
    const response = await apiClient.patch<ApiResponse<ApiAppointment>>(
      `/calendar/appointments/${id}/status`,
      { status, cancelReason },
    );
    return response.data.data;
  },
  async delete(id: number) {
    await apiClient.delete(`/calendar/appointments/${id}`);
  },
  async deleteGuest(id: number) {
    await apiClient.delete(`/crm/guests/${id}`);
  },
  async findGuestByPhone(phone: string) {
    try {
      const response = await apiClient.get<
        ApiResponse<{ id: number; name: string }>
      >(`/crm/guests/by-phone/${encodeURIComponent(phone)}`);
      return response.data.data;
    } catch (error) {
      if (isNotFoundError(error)) return null;
      throw error;
    }
  },
  async createQuickGuest(name: string, phone?: string) {
    const trimmedPhone = phone?.trim();
    // Reuse an existing guest with the same phone instead of hitting the
    // unique constraint and leaving an orphaned appointment-less guest behind.
    if (trimmedPhone) {
      const existing = await calendarService.findGuestByPhone(trimmedPhone);
      if (existing) return { ...existing, created: false };
    }
    const response = await apiClient.post<
      ApiResponse<{ id: number; name: string }>
    >("/crm/guests", { name: name.trim(), phone: trimmedPhone || undefined });
    return { ...response.data.data, created: true };
  },
};

const isNotFoundError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "response" in error &&
  (error as { response?: { status?: number } }).response?.status === 404;
