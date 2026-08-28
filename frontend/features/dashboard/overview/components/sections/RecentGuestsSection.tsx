"use client";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import LoadingState from "@/shared/components/molecules/LoadingState";
import { useOverviewStats } from "@/features/dashboard/overview/hooks/useOverview";

const relativeTime = (
  iso: string,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60)
    return t("dashboard.overview.recentGuests.time.minAgo", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    if (hours === 1)
      return t("dashboard.overview.recentGuests.time.hourAgo", {
        count: hours,
      });
    return t("dashboard.overview.recentGuests.time.hoursAgo", { count: hours });
  }
  const days = Math.floor(hours / 24);
  if (days === 1) return t("dashboard.overview.recentGuests.time.yesterday");
  if (days < 7)
    return t("dashboard.overview.recentGuests.time.daysAgo", { count: days });
  return t("dashboard.overview.recentGuests.time.lastWeek");
};

const RecentGuestsSection = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useOverviewStats();
  const guests = data?.recentGuests ?? [];

  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <h2 className="text-lg font-semibold text-[#171A21]">
        {t("dashboard.overview.recentGuests.title")}
      </h2>
      <p className="mt-0.5 text-sm text-[#8D95A5]">
        {t("dashboard.overview.recentGuests.subtitle")}
      </p>

      {isLoading ? (
        <LoadingState
          className="mt-4"
          label={t("dashboard.overview.recentGuests.loading")}
        />
      ) : guests.length === 0 ? (
        <p className="mt-4 text-sm text-[#8D95A5]">
          {t("dashboard.overview.recentGuests.empty")}
        </p>
      ) : (
        <ul className="mt-4 space-y-1">
          {guests.map((guest) => (
            <li key={guest.id}>
              <a
                href="#"
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[#F9FAFB]"
              >
                <div className="flex items-center gap-3">
                  <InitialsAvatar name={guest.name} className="h-9 w-9" />
                  <div>
                    <p className="text-sm font-medium text-[#171A21]">
                      {guest.name}
                    </p>
                    <p className="text-xs text-[#8D95A5]">
                      {relativeTime(guest.lastVisitAt, t)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#C3C8D1]" />
              </a>
            </li>
          ))}
        </ul>
      )}

      <a
        href="#"
        className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
      >
        {t("dashboard.overview.recentGuests.viewAll")}
      </a>
    </section>
  );
};

export default RecentGuestsSection;
