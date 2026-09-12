"use client";

import { useTranslation } from "react-i18next";

import LoadingState from "@/shared/components/molecules/LoadingState";
import { NULL_TEXT_KEY } from "@/shared/lib/constants";
import QueueStatusCell from "@/features/dashboard/overview/components/sections/QueueStatusCell";
import { useOverviewStats } from "@/features/dashboard/overview/hooks/useOverview";

const LiveQueuePanel = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useOverviewStats();
  const queue = data?.liveQueue ?? [];

  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#171A21]">
            {t("dashboard.calendar.queue.title")}
          </h2>
          <p className="mt-0.5 text-sm text-[#8D95A5]">
            {t("dashboard.calendar.queue.subtitle")}
          </p>
        </div>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-white">
          {queue.length}
        </span>
      </div>

      {isLoading ? (
        <LoadingState
          className="mt-4"
          label={t("dashboard.calendar.queue.loading")}
        />
      ) : queue.length === 0 ? (
        <p className="mt-4 text-sm text-[#8D95A5]">
          {t("dashboard.calendar.queue.empty")}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-[#DEE1E7]">
                <th className="pb-2 text-left text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.calendar.queue.col.guest")}
                </th>
                <th className="pb-2 text-left text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.calendar.queue.col.service")}
                </th>
                <th className="pb-2 text-left text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.calendar.queue.col.staff")}
                </th>
                <th className="pb-2 text-left text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.calendar.queue.col.notes")}
                </th>
                <th className="pb-2 text-right text-[13px] font-medium text-[#8D95A5]">
                  {t("dashboard.calendar.queue.col.status")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0F3]">
              {queue.map((guest) => (
                <tr key={guest.id} className="group">
                  <td className="py-3 text-base font-medium text-[#171A21]">
                    {guest.guestName}
                  </td>
                  <td className="py-3 text-base text-[#171A21]">
                    {guest.serviceName}
                  </td>
                  <td className="py-3 text-base text-[#171A21]">
                    {guest.staffName}
                  </td>
                  <td className="py-3 text-base italic text-[#8D95A5]">
                    {guest.notes || t(NULL_TEXT_KEY)}
                  </td>
                  <td className="py-3 text-right">
                    <QueueStatusCell
                      appointmentId={guest.id}
                      status={guest.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default LiveQueuePanel;
