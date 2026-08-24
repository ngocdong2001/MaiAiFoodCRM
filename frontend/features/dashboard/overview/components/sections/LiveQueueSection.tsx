"use client";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { NULL_TEXT_KEY } from "@/shared/lib/constants";
import { useOverviewStats } from "@/features/dashboard/overview/hooks/useOverview";

const statusBadge = (status: string, t: (key: string) => string) => {
  switch (status) {
    case "waiting":
      return {
        label: t("dashboard.overview.queue.status.waiting"),
        className: "bg-[#F97316] text-white",
      };
    case "ready":
    default:
      return {
        label: t("dashboard.overview.queue.status.ready"),
        className: "bg-primary text-white",
      };
  }
};

const LiveQueueSection = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useOverviewStats();
  const queue = data?.liveQueue ?? [];

  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <h2 className="text-lg font-semibold text-[#171A21]">
        {t("dashboard.overview.queue.title")}
      </h2>
      <p className="mt-0.5 text-sm text-[#8D95A5]">
        {t("dashboard.overview.queue.subtitle")}
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-[#8D95A5]">
          {t("dashboard.overview.queue.loading")}
        </p>
      ) : queue.length === 0 ? (
        <p className="mt-4 text-sm text-[#8D95A5]">
          {t("dashboard.overview.queue.empty")}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[#DEE1E7]">
                <th className="pb-2 text-left text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.overview.queue.col.guest")}
                </th>
                <th className="pb-2 text-left text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.overview.queue.col.service")}
                </th>
                <th className="pb-2 text-left text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.overview.queue.col.notes")}
                </th>
                <th className="pb-2 text-right text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.overview.queue.col.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F3]">
              {queue.map((guest) => {
                const badge = statusBadge(guest.status, t);
                return (
                  <tr key={guest.id} className="group">
                    <td className="py-3 text-base font-medium text-[#171A21]">
                      {guest.guestName}
                    </td>
                    <td className="py-3 text-base text-[#171A21]">
                      {guest.serviceName}
                    </td>
                    <td className="py-3 text-base italic text-[#8D95A5]">
                      {guest.notes || t(NULL_TEXT_KEY)}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold",
                          badge.className,
                        )}
                      >
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
