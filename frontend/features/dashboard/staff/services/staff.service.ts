import { apiClient } from "@/core/config/axios.config";

import type {
  StaffFormValues,
  StaffMember,
  StaffSpecialty,
  StaffStatus,
} from "../types/staff.types";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export type StaffListParams = {
  search?: string;
  status?: StaffStatus;
  date: string;
};

const toPayload = (values: StaffFormValues) => {
  const payload: any = {
    name: values.name,
    role: values.role,
    status: values.status,
    phone: values.phone || null,
    email: values.email || null,
    avatarUrl: values.avatarUrl || null,
    hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : null,
    commissionRate: values.commissionRate
      ? Number(values.commissionRate)
      : null,
    joinDate: values.joinDate || null,
    specialtyIds: values.specialtyIds,
  };

  // Include weeklySchedule if set
  if (values.weeklySchedule) {
    payload.weeklySchedule = values.weeklySchedule;
  }

  // Include per-day override schedule if scheduleDate is set
  if (values.scheduleDate) {
    payload.schedule = {
      date: values.scheduleDate,
      startTime: values.startTime,
      endTime: values.endTime,
      breakStart: values.breakStart || null,
      breakEnd: values.breakEnd || null,
      isDayOff: values.isDayOff,
      note: values.station || null,
    };
  }

  return payload;
};

const normalizeMember = (member: Omit<StaffMember, "key">): StaffMember => ({
  ...member,
  key: String(member.id),
});

export const staffService = {
  async getAll(params: StaffListParams) {
    const response = await apiClient.get<ApiResponse<Array<Omit<StaffMember, "key">>>>(
      "/staff",
      { params },
    );
    return response.data.data.map(normalizeMember);
  },

  async getSpecialties() {
    const response = await apiClient.get<ApiResponse<StaffSpecialty[]>>(
      "/staff/specialties",
    );
    return response.data.data;
  },

  async create(values: StaffFormValues) {
    const response = await apiClient.post<ApiResponse<Omit<StaffMember, "key">>>(
      "/staff",
      toPayload(values),
    );
    return normalizeMember(response.data.data);
  },

  async update(id: number, values: StaffFormValues) {
    const response = await apiClient.put<ApiResponse<Omit<StaffMember, "key">>>(
      `/staff/${id}`,
      toPayload(values),
    );
    return normalizeMember(response.data.data);
  },

  async delete(id: number) {
    await apiClient.delete(`/staff/${id}`);
  },
};