"use client";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { useOverviewStats } from "@/features/dashboard/overview/hooks/useOverview";

const TodaysSnapshotSection = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useOverviewStats();
  const snapshot = data?.todaysSnapshot ?? [];

  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <h2 className="text-lg font-semibold text-[#171A21]">
        {t("dashboard.overview.snapshot.title")}
      </h2>
      <p className="mt-0.5 text-sm text-[#8D95A5]">
        {t("dashboard.overview.snapshot.subtitle")}
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-[#8D95A5]">
          {t("dashboard.overview.snapshot.loading")}
        </p>
      ) : snapshot.length === 0 ? (
        <p className="mt-4 text-sm text-[#8D95A5]">
          {t("dashboard.overview.snapshot.empty")}
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {snapshot.map((item) => (
            <li key={item.id} className="flex items-start gap-6">
              <span className="w-16 shrink-0 text-sm text-[#8D95A5]">
                {item.time}
              </span>
              <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                      item.status === "break" ? "bg-[#D1D5DB]" : "bg-primary",
                    )}
                  />
                  <span className="text-sm text-[#1d1f23]">{item.title}</span>
                </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TodaysSnapshotSection;
