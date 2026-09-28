import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuthStore } from "@/core/store/authStore";
import { overviewService } from "../services/overview.service";

const overviewStatsKey = ["overview", "stats"] as const;
const calendarAppointmentsKey = ["calendar", "appointments"] as const;
export const notificationsKey = ["overview", "notifications"] as const;

// Kept alive at the dashboard layout level (not tied to the Overview page)
// so restoring/updating a booking from any page still refreshes the Live Queue.
export const useQueueEventsSubscription = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  useEffect(() => {
    if (!hydrated || !token) return;

    const controller = new AbortController();
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = async () => {
      try {
        await overviewService.streamQueue(controller.signal, (event) => {
          void queryClient.invalidateQueries({ queryKey: overviewStatsKey });
          void queryClient.invalidateQueries({
            queryKey: calendarAppointmentsKey,
          });
          if (event.reason === "appointment.created") {
            void queryClient.invalidateQueries({ queryKey: notificationsKey });
          }
        });
        if (!controller.signal.aborted) retryTimer = setTimeout(connect, 3_000);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn(
            "Overview queue stream disconnected; reconnecting",
            error,
          );
          retryTimer = setTimeout(connect, 3_000);
        }
      }
    };

    void connect();
    return () => {
      controller.abort();
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [hydrated, queryClient, token]);
};

export const useOverviewStats = () => {
  return useQuery({
    queryKey: overviewStatsKey,
    queryFn: overviewService.getStats,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
};

export const useNotifications = () =>
  useQuery({
    queryKey: notificationsKey,
    queryFn: overviewService.getNotifications,
    staleTime: 30_000,
  });

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: overviewService.markAllNotificationsRead,
    onSuccess: () => {
      const readAt = new Date().toISOString();
      queryClient.setQueryData(
        notificationsKey,
        (notifications: Awaited<ReturnType<typeof overviewService.getNotifications>> | undefined) =>
          notifications?.map((notification) => ({ ...notification, readAt })),
      );
    },
  });
};
