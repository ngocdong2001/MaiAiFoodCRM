import { Clock, MessageSquare, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { useCalendarData } from "../../context/CalendarDataContext";

const LiveQueuePanel = () => {
  const { t } = useTranslation();
  const { queueRequests } = useCalendarData();
  return (
    <aside className="flex w-full flex-col gap-4 rounded-xl border border-[#DEE1E7] bg-[#F9FAFB] p-6 shadow-[0px_1px_2px_0px_#0000000a]">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#171A21]">
              {t("dashboard.calendar.queue.title")}
            </h2>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-white">
              {queueRequests.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#8D95A5]">
            {t("dashboard.calendar.queue.subtitle")}
          </p>
        </div>
        <button
          type="button"
          aria-label={t("dashboard.calendar.queue.add")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8D95A5] transition-colors hover:bg-[#EEF0F3] hover:text-[#171A21]"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <ul className="space-y-3">
        {queueRequests.map((request) => (
          <li
            key={request.key}
            className="rounded-xl border border-[#DEE1E7] bg-white p-3 shadow-[0px_1px_2px_0px_#0000000a]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <InitialsAvatar name={request.name} className="h-9 w-9" />
                <div>
                  <p className="text-sm font-medium text-[#171A21]">
                    {request.name}
                  </p>
                  <p className="text-xs text-[#8D95A5]">{request.service}</p>
                </div>
              </div>
              <span className="text-xs font-medium text-[#8D95A5]">
                {request.wait}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#DEE1E7] bg-white px-3 py-1.5 text-xs font-medium text-[#171A21] transition-colors hover:bg-[#F9FAFB]"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                {t("dashboard.calendar.queue.message")}
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/90"
              >
                {t("dashboard.calendar.queue.accept")}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex flex-col items-center gap-2 rounded-xl border border-dashed border-[#DEE1E7] px-4 py-6 text-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F3F5]">
          <Clock className="h-4 w-4 text-[#8D95A5]" />
        </span>
        <p className="text-sm font-medium text-[#171A21]">
          {t("dashboard.calendar.queue.emptyTitle")}
        </p>
        <p className="text-xs text-[#8D95A5]">
          {t("dashboard.calendar.queue.emptyDescription")}
        </p>
      </div>
    </aside>
  );
};

export default LiveQueuePanel;
