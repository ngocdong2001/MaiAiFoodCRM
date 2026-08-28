"use client";
import { useTranslation } from "react-i18next";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import LoadingState from "@/shared/components/molecules/LoadingState";
import { cn } from "@/shared/lib/utils";
import { useOverviewStats } from "@/features/dashboard/overview/hooks/useOverview";

const statusColor: Record<string, string> = {
  active: "bg-[#2FA35C]",
  busy: "bg-[#F59E0B]",
  on_leave: "bg-[#8D95A5]",
  inactive: "bg-[#DEE1E7]",
};

const StaffOnDutySection = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useOverviewStats();
  const staff = data?.staffOnDuty ?? [];

  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-[#171A21]">
            {t("dashboard.overview.staffOnDuty.title")}
          </h2>
          <p className="mt-0.5 text-sm text-[#8D95A5]">
            {t("dashboard.overview.staffOnDuty.subtitle")}
          </p>
        </div>
        {!isLoading && (
          <span className="rounded-full bg-[#F0FDF4] px-2.5 py-1 text-xs font-semibold text-[#2FA35C]">
            {
              staff.filter((s) => s.status === "active" || s.status === "busy")
                .length
            }{" "}
            {t("dashboard.overview.staffOnDuty.active")}
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingState
          className="mt-4"
          label={t("dashboard.overview.staffOnDuty.loading")}
        />
      ) : staff.length === 0 ? (
        <p className="mt-4 text-sm text-[#8D95A5]">
          {t("dashboard.overview.staffOnDuty.empty")}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {staff.map((member) => (
            <li key={member.id} className="flex items-center gap-3">
              <div className="relative shrink-0">
                <InitialsAvatar name={member.name} className="h-9 w-9" />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white",
                    statusColor[member.status] ?? "bg-[#DEE1E7]",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#171A21]">
                  {member.name}
                </p>
                <p className="text-xs text-[#8D95A5]">{member.role}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-[#171A21]">
                  {member.appointmentCountToday}
                </p>
                <p className="text-xs text-[#8D95A5]">
                  {t("dashboard.overview.staffOnDuty.appointments")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default StaffOnDutySection;
