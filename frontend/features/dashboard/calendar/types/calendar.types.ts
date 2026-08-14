import type { LucideIcon } from "lucide-react";

import type {
  SchedulerEvent,
  SchedulerResource,
} from "@/shared/components/molecules/CalendarScheduler";

export type StaffMember = {
  key: string;
  name: string;
  role: string;
  active: boolean;
};

export type ScheduleColumn = {
  key: string;
  name: string;
  role: string;
};

export type AppointmentDetailData = {
  status: string;
  guest: string;
  membership: string;
  visit: string;
  service: string;
  stylist: string;
  duration: string;
  timeRange: string;
  station: string;
  stationArea: string;
  clientNotes: string;
  aiSuggestion: {
    icon: LucideIcon;
    title: string;
    description: string;
  };
};

export type QueueRequest = {
  key: string;
  name: string;
  service: string;
  wait: string;
};

export type CalendarAppointment = SchedulerEvent & {
  detail: AppointmentDetailData;
};

export type CalendarData = {
  staffMembers: StaffMember[];
  miniCalendar: {
    monthLabel: string;
    weekdays: string[];
    days: number[];
    selectedDay: number;
  };
  scheduleColumns: ScheduleColumn[];
  schedulerResources: SchedulerResource[];
  schedulerAnchorDate: { year: number; month: number; day: number };
  schedulerDayRange: { startHour: number; endHour: number };
  schedulerEvents: CalendarAppointment[];
  queueRequests: QueueRequest[];
};

export type CalendarOption = {
  id: number;
  name: string;
};

export type CalendarOptions = {
  guests: Array<CalendarOption & { phone: string | null }>;
  staff: Array<CalendarOption & { role: string }>;
  services: Array<CalendarOption & { price: number; durationMinutes: number }>;
};

export type ApiAppointment = {
  id: number;
  guestId: number;
  staffId: number;
  startTime: string;
  endTime: string;
  status: string;
  priority: string;
  notes: string | null;
  station: string | null;
  guest: CalendarOption & {
    totalVisits: number;
    loyaltyPoints: number;
    notes: string | null;
  };
  staff: CalendarOption & { role: string };
  services: Array<CalendarOption & { price: number; durationMinutes: number }>;
};
