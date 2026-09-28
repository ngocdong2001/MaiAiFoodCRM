import { apiClient } from "@/core/config/axios.config";

import type { GuestCard, GuestFormValues, GuestTag } from "../types/crm.types";

type ApiResponse<T> = { success: boolean; data: T; message?: string };

type ApiGuest = Omit<GuestCard, "key" | "roleTag" | "listMeta" | "clientSince"> & { memberSince: string };

const normalizeGuest = (guest: ApiGuest): GuestCard => ({
  ...guest,
  key: String(guest.id),
  roleTag: guest.tags[0]?.name ?? "No tags",
  listMeta: guest.lastVisit ? new Date(guest.lastVisit).toLocaleDateString() : "No visits",
  clientSince: new Date(guest.memberSince).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
});

const payload = (values: GuestFormValues) => ({
  name: values.name,
  email: values.email || null,
  phone: values.phone || null,
  avatarUrl: values.avatarUrl || null,
  gender: values.gender || null,
  dateOfBirth: values.dateOfBirth || null,
  loyaltyPoints: values.loyaltyPoints ? Number(values.loyaltyPoints) : 0,
  smsConsent: values.smsConsent,
  notes: values.notes || null,
  tagIds: values.tagIds,
});

export const crmService = {
  async getGuests(params: { search?: string; segment?: string }) {
    const response = await apiClient.get<ApiResponse<ApiGuest[]>>("/crm/guests", { params });
    return response.data.data.map(normalizeGuest);
  },
  async getTags() {
    const response = await apiClient.get<ApiResponse<GuestTag[]>>("/crm/tags");
    return response.data.data;
  },
  async create(values: GuestFormValues) {
    const response = await apiClient.post<ApiResponse<ApiGuest>>("/crm/guests", payload(values));
    return normalizeGuest(response.data.data);
  },
  async update(id: number, values: GuestFormValues) {
    const response = await apiClient.put<ApiResponse<ApiGuest>>(`/crm/guests/${id}`, payload(values));
    return normalizeGuest(response.data.data);
  },
  async updateNotes(id: number, content: string) {
    const response = await apiClient.put<ApiResponse<ApiGuest>>(`/crm/guests/${id}/notes`, { content, author: "Owner" });
    return normalizeGuest(response.data.data);
  },
  async delete(id: number) {
    await apiClient.delete(`/crm/guests/${id}`);
  },
};