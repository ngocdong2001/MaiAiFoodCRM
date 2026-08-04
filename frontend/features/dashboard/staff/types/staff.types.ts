export type StaffStatus = "Active" | "Busy" | "On Leave";

export type StaffMember = {
  key: string;
  name: string;
  role: string;
  status: StaffStatus;
  avatarUrl: string;
  shift?: string;
  station?: string;
};

export type ScheduleSlot = {
  staffKey: string;
  startHour: number;
  endHour: number;
  station: string;
};
