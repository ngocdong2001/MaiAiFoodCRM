export type StaffStatus = "active" | "busy" | "on_leave";

export type StaffSpecialty = {
  id: number;
  name: string;
  description: string | null;
};

export type StaffSchedule = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  isDayOff: boolean;
  note: string | null;
};

export type StaffMember = {
  id: number;
  key: string;
  name: string;
  role: string;
  status: StaffStatus;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  hourlyRate: number | null;
  commissionRate: number | null;
  joinDate: string | null;
  specialties: StaffSpecialty[];
  schedules: StaffSchedule[];
};

export type StaffFormValues = {
  name: string;
  role: string;
  status: StaffStatus;
  phone: string;
  email: string;
  avatarUrl: string;
  hourlyRate: string;
  commissionRate: string;
  joinDate: string;
  specialtyIds: number[];
  scheduleDate: string;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  isDayOff: boolean;
  station: string;
};

export const staffStatusLabels: Record<StaffStatus, string> = {
  active: "Active",
  busy: "Busy",
  on_leave: "On Leave",
};
