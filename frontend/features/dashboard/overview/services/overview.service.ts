import { apiClient, getApiUrl } from "@/core/config/axios.config";
import { getStoredAuthToken, useAuthStore } from "@/core/store/authStore";

export type OverviewStats = {
  upcomingBookings: number;
  newBookingsToday: number;
  activePending: number;
  recentCheckIns: number;
  completedToday: number;
  todayRevenue: number;
  seatUtilization: number;
  seatUtilizationDelta: number;
};

export type QueueItem = {
  id: number;
  guestName: string;
  serviceName: string;
  staffName: string;
  startTime: string;
  notes: string | null;
  status: string;
  urgent: boolean;
};

export type SnapshotItem = {
  id: number;
  time: string;
  serviceName: string;
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

export type QueueEvent = {
  type: "queue.changed";
  reason: string;
  appointmentId: number;
  occurredAt: string;
};

const parseSseBlock = (block: string): QueueEvent | null => {
  const eventName = block
    .split("\n")
    .find((line) => line.startsWith("event:"))
    ?.slice(6)
    .trim();
  if (eventName !== "queue.changed") return null;

  const data = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");
  if (!data) return null;

  try {
    return JSON.parse(data) as QueueEvent;
  } catch {
    return null;
  }
};

export const overviewService = {
  async getStats(): Promise<OverviewData> {
    const response =
      await apiClient.get<ApiResponse<OverviewData>>("/overview/stats");
    return response.data.data;
  },

  async streamQueue(
    signal: AbortSignal,
    onEvent: (event: QueueEvent) => void,
  ): Promise<void> {
    const token = getStoredAuthToken();
    if (!token) return;

    const tenantSlug = useAuthStore.getState().tenant?.slug;
    const response = await fetch(getApiUrl("/overview/queue/events"), {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${token}`,
        ...(tenantSlug ? { "X-Tenant-ID": tenantSlug } : {}),
      },
      cache: "no-store",
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Queue stream failed with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (!signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

      let boundary = buffer.indexOf("\n\n");
      while (boundary >= 0) {
        const event = parseSseBlock(buffer.slice(0, boundary));
        buffer = buffer.slice(boundary + 2);
        if (event) onEvent(event);
        boundary = buffer.indexOf("\n\n");
      }
    }
  },
};
