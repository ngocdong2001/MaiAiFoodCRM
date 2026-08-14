"use client";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { statCards } from "@/features/dashboard/overview/data/data";

const StatsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.key}
            className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]"
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-[#8D95A5]">
                {t(`dashboard.overview.stats.${card.key}.label`, {
                  defaultValue: card.label,
                })}
              </p>
              <Icon className="h-4 w-4 text-[#8D95A5]" />
            </div>
            <p className="mt-3 text-2xl font-bold text-[#171A21]">
              {card.value}
            </p>
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                card.hintTone === "positive"
                  ? "text-[#2FA35C]"
                  : "text-[#8D95A5]",
              )}
            >
              {t(`dashboard.overview.stats.${card.key}.hint`, {
                defaultValue: card.hint,
              })}
            </p>
          </div>
        );
      })}
    </section>
  );
};

export default StatsSection;
