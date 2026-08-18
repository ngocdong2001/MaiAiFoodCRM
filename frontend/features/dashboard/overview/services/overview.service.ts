import { apiClient } from "@/core/config/axios.config";

export type OverviewStats = {
  upcomingBookings: number;
  newBookingsToday: number;
  activePending: number;
  recentCheckIns: number;
  completedToday: number;
  todayRevenue: number;
};

export type QueueItem = {
  id: number;
  guestName: string;
  serviceName: string;
  startTime: string;
  status: string;
  urgent: boolean;
};

export type SnapshotItem = {
  id: number;
  time: string;
  title: string;
  staffName: string;
  status: string;
};

export type RecentGuestItem = {
  id: number;
  name: string;
  lastVisitAt: string;
};

export type StaffOnDutyItem = {
  id: number;
  name: string;
  role: string;
  avatarUrl: string | null;
  status: string;
  appointmentCountToday: number;
};

export type OverviewData = {
  stats: OverviewStats;
  liveQueue: QueueItem[];
  todaysSnapshot: SnapshotItem[];
  recentGuests: RecentGuestItem[];
  staffOnDuty: StaffOnDutyItem[];
};

type ApiResponse<T> = { success: boolean; data: T };

export const overviewService = {
  async getStats(): Promise<OverviewData> {
    const response = await apiClient.get<ApiResponse<OverviewData>>("/overview/stats");
    return response.data.data;
  },
};

