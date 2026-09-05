"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import LoadingState from "@/shared/components/molecules/LoadingState";
import { NULL_TEXT_KEY } from "@/shared/lib/constants";
import { useOverviewStats } from "@/features/dashboard/overview/hooks/useOverview";

import QueueStatusCell from "./QueueStatusCell";

const VISIBLE_LIMIT = 5;

const LiveQueueSection = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useOverviewStats();
  const queue = data?.liveQueue ?? [];
  const [expanded, setExpanded] = useState(false);
  const hasOverflow = queue.length > VISIBLE_LIMIT;
  const visibleQueue = expanded ? queue : queue.slice(0, VISIBLE_LIMIT);

  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <h2 className="text-lg font-semibold text-[#171A21]">
        {t("dashboard.overview.queue.title")}
      </h2>
      <p className="mt-0.5 text-sm text-[#8D95A5]">
        {t("dashboard.overview.queue.subtitle")}
      </p>

      {isLoading ? (
        <LoadingState
          className="mt-4"
          label={t("dashboard.overview.queue.loading")}
        />
      ) : queue.length === 0 ? (
        <p className="mt-4 text-sm text-[#8D95A5]">
          {t("dashboard.overview.queue.empty")}
        </p>
      ) : (
        <div
          className={
            expanded
              ? "mt-4 max-h-105 overflow-y-auto overflow-x-auto"
              : "mt-4 overflow-x-auto"
          }
        >
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
                <th className="pb-2 text-left text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.overview.queue.col.appointmentTime")}
                </th>
                <th className="pb-2 text-right text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.overview.queue.col.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F3]">
              {visibleQueue.map((guest) => {
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
                    <td className="py-3 text-base text-[#171A21]">
                      {new Date(`${guest.startTime}`).toLocaleTimeString(
                        "vi-VN",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <QueueStatusCell
                        appointmentId={guest.id}
                        status={guest.status}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {hasOverflow && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-4 block w-full text-center text-sm font-medium text-primary hover:underline"
        >
          {expanded
            ? t("dashboard.overview.queue.collapseQueue")
            : t("dashboard.overview.queue.viewFullQueue")}
        </button>
      )}
    </section>
  );
};

export default LiveQueueSection;
