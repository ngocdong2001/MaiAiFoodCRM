"use client";
import { CalendarCheck2, CalendarClock, CheckCircle2, DollarSign, Users, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

import StatCard from "@/shared/components/molecules/StatCard";
import { useOverviewStats } from "@/features/dashboard/overview/hooks/useOverview";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

const StatsSection = () => {
  const { t } = useTranslation();
  const { data, isLoading } = useOverviewStats();
  const s = data?.stats;

  const cards = [
    {
      key: "upcoming-bookings",
      label: t("dashboard.overview.stats.upcoming-bookings.label", { defaultValue: "Upcoming Bookings" }),
      value: isLoading ? "—" : fmt(s?.upcomingBookings ?? 0),
      hint: isLoading ? "" : `+${s?.newBookingsToday ?? 0} created today`,
      hintTone: "positive" as const,
      icon: CalendarClock,
    },
    {
      key: "completed-today",
      label: t("dashboard.overview.stats.completed-today.label", { defaultValue: "Completed Today" }),
      value: isLoading ? "—" : fmt(s?.completedToday ?? 0),
      hint: isLoading ? "" : `of ${(s?.completedToday ?? 0) + (s?.recentCheckIns ?? 0) + (s?.activePending ?? 0)} total today`,
      hintTone: "positive" as const,
      icon: CheckCircle2,
    },
    {
      key: "today-revenue",
      label: t("dashboard.overview.stats.today-revenue.label", { defaultValue: "Today's Revenue" }),
      value: isLoading ? "—" : `$${fmt(s?.todayRevenue ?? 0)}`,
      hint: isLoading ? "" : `from ${s?.completedToday ?? 0} paid appointments`,
      hintTone: "positive" as const,
      icon: DollarSign,
    },
    {
      key: "active-now",
      label: t("dashboard.overview.stats.active-now.label", { defaultValue: "Active Right Now" }),
      value: isLoading ? "—" : fmt(s?.recentCheckIns ?? 0),
      hint: "confirmed & in progress",
      hintTone: "muted" as const,
      icon: Zap,
    },
    {
      key: "active-waitlist",
      label: t("dashboard.overview.stats.active-waitlist.label", { defaultValue: "Waiting" }),
      value: isLoading ? "—" : `${fmt(s?.activePending ?? 0)} guests`,
      hint: "pending today",
      hintTone: "muted" as const,
      icon: Users,
    },
    {
      key: "new-bookings",
      label: t("dashboard.overview.stats.new-bookings.label", { defaultValue: "New Bookings" }),
      value: isLoading ? "—" : fmt(s?.newBookingsToday ?? 0),
      hint: "created today",
      hintTone: "muted" as const,
      icon: CalendarCheck2,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <StatCard
            key={card.key}
            label={card.label}
            value={card.value}
            icon={<Icon className="h-4 w-4 text-[#8D95A5]" />}
            hint={card.hint}
            hintClassName={card.hintTone === "positive" ? "text-[#2FA35C]" : "text-[#8D95A5]"}
          />
        );
      })}
    </section>
  );
};

export default StatsSection;


