"use client";
import { useTranslation } from "react-i18next";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { useOverviewStats } from "@/features/dashboard/overview/hooks/useOverview";

const TodaysSnapshotSection = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useOverviewStats();
  const snapshot = data?.todaysSnapshot ?? [];

  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <h2 className="text-base font-semibold text-[#171A21]">
        {t("dashboard.overview.snapshot.title")}
      </h2>
      <p className="mt-0.5 text-sm text-[#8D95A5]">
        {t("dashboard.overview.snapshot.subtitle")}
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-[#8D95A5]">Loading…</p>
      ) : snapshot.length === 0 ? (
        <p className="mt-4 text-sm text-[#8D95A5]">No appointments scheduled for today.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {snapshot.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                <span className="w-16 shrink-0 text-sm font-medium text-[#8D95A5]">
                  {item.time}
                </span>
                <span className="text-sm text-[#171A21]">{item.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <InitialsAvatar name={item.staffName} className="h-6 w-6" />
                <span className="hidden text-xs text-[#8D95A5] sm:block">
                  {item.staffName}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TodaysSnapshotSection;

