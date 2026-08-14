"use client";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { liveQueue } from "@/features/dashboard/overview/data/data";

const LiveQueueSection = () => {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <h2 className="text-base font-semibold text-[#171A21]">
        {t("dashboard.overview.queue.title")}
      </h2>
      <p className="mt-0.5 text-sm text-[#8D95A5]">
        {t("dashboard.overview.queue.subtitle")}
      </p>

      <ul className="mt-4 divide-y divide-[#EEF0F3]">
        {liveQueue.map((guest) => (
          <li
            key={guest.key}
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
                <p className="text-sm font-medium text-[#171A21]">
                  {guest.name}
                </p>
                <p className="text-xs text-[#8D95A5]">
                  {t(`dashboard.overview.queue.items.${guest.key}.service`, {
                    defaultValue: guest.service,
                  })}
                </p>
              </div>
            </div>
            <span
              className={cn(
                "text-sm font-medium",
                guest.status === "Ready"
                  ? "text-[#2FA35C]"
                  : guest.status === "New"
                    ? "text-primary"
                    : "text-[#8D95A5]",
              )}
            >
              {t(`dashboard.overview.queue.items.${guest.key}.status`, {
                defaultValue: guest.status,
              })}
            </span>
          </li>
        ))}
      </ul>

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
