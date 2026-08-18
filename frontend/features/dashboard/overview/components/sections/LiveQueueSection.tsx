"use client";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { useOverviewStats } from "@/features/dashboard/overview/hooks/useOverview";

const statusLabel = (item: { status: string; startTime: string; urgent: boolean }) => {
  if (item.status === "in_progress") return "Now";
  if (item.urgent) return "Soon";
  const mins = Math.round((new Date(item.startTime).getTime() - Date.now()) / 60000);
  if (mins <= 0) return "Overdue";
  return `${mins} min`;
};

const LiveQueueSection = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useOverviewStats();
  const queue = data?.liveQueue ?? [];

  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <h2 className="text-base font-semibold text-[#171A21]">
        {t("dashboard.overview.queue.title")}
      </h2>
      <p className="mt-0.5 text-sm text-[#8D95A5]">
        {t("dashboard.overview.queue.subtitle")}
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-[#8D95A5]">Loading…</p>
      ) : queue.length === 0 ? (
        <p className="mt-4 text-sm text-[#8D95A5]">No active appointments today.</p>
      ) : (
        <ul className="mt-4 divide-y divide-[#EEF0F3]">
          {queue.map((guest) => {
            const label = statusLabel(guest);
            return (
              <li
                key={guest.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      guest.urgent ? "bg-primary" : "bg-transparent",
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium text-[#171A21]">{guest.guestName}</p>
                    <p className="text-xs text-[#8D95A5]">{guest.serviceName}</p>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    label === "Now"
                      ? "text-[#2FA35C]"
                      : guest.urgent
                        ? "text-primary"
                        : "text-[#8D95A5]",
                  )}
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <a
        href="#"
        className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
      >
        {t("dashboard.overview.queue.viewFullQueue")}
      </a>
    </section>
  );
};

export default LiveQueueSection;

