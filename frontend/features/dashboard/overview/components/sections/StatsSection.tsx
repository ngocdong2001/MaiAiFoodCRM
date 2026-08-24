"use client";
import {
  CalendarDays,
  Clock,
  Gauge,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import StatCard from "@/shared/components/molecules/StatCard";
import { cn } from "@/shared/lib/utils";
import { useOverviewStats } from "@/features/dashboard/overview/hooks/useOverview";

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

const StatsSection = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useOverviewStats();
  const s = data?.stats;

  const cards = [
    {
      key: "upcoming-bookings",
      label: t("dashboard.overview.stats.upcoming-bookings.label"),
      value: isLoading ? "—" : fmt(s?.upcomingBookings ?? 0),
      hint: isLoading
        ? ""
        : t("dashboard.overview.stats.upcoming-bookings.hint", {
            count: s?.newBookingsToday ?? 0,
          }),
      hintTone: "positive" as const,
      icon: CalendarDays,
      iconColor: "text-primary",
    },
    {
      key: "seat-utilization",
      label: t("dashboard.overview.stats.seat-utilization.label"),
      value: isLoading ? "—" : `${s?.seatUtilization ?? 0}%`,
      hint: isLoading
        ? ""
        : t("dashboard.overview.stats.seat-utilization.hint", {
            percent: s?.seatUtilizationDelta ?? 12,
          }),
      hintTone: "positive" as const,
      icon: Gauge,
      iconColor: "text-[#171A21]",
    },
    {
      key: "waitlist",
      label: t("dashboard.overview.stats.waitlist.label"),
      value: isLoading
        ? "—"
        : `${fmt(s?.activePending ?? 0)} ${t("dashboard.overview.stats.waitlist.value")}`,
      hint: t("dashboard.overview.stats.waitlist.hint"),
      hintTone: "muted" as const,
      icon: Users,
      iconColor: "text-[#A17DE8]",
    },
    {
      key: "guest-activity",
      label: t("dashboard.overview.stats.guest-activity.label"),
      value: isLoading
        ? "—"
        : `${fmt(s?.recentCheckIns ?? 0)} ${t("dashboard.overview.stats.guest-activity.value")}`,
      hint: t("dashboard.overview.stats.guest-activity.hint"),
      hintTone: "muted" as const,
      icon: Clock,
      iconColor: "text-[#171A21]",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <StatCard
            key={card.key}
            label={card.label}
            value={card.value}
            icon={<Icon className={cn("h-4 w-4", card.iconColor)} />}
            hint={card.hint}
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
