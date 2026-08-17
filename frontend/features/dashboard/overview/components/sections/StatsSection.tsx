"use client";
import { useTranslation } from "react-i18next";

import StatCard from "@/shared/components/molecules/StatCard";
import { statCards } from "@/features/dashboard/overview/data/data";

const StatsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <StatCard
            key={card.key}
            label={t(`dashboard.overview.stats.${card.key}.label`, {
              defaultValue: card.label,
            })}
            value={card.value}
            icon={<Icon className="h-4 w-4 text-[#8D95A5]" />}
            hint={t(`dashboard.overview.stats.${card.key}.hint`, {
              defaultValue: card.hint,
            })}
            hintClassName={
              card.hintTone === "positive" ? "text-[#2FA35C]" : "text-[#8D95A5]"
            }
          />
        );
      })}
    </section>
  );
};

export default StatsSection;
