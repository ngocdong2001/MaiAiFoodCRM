"use client";

import {
  DollarSign,
  Scissors,
  TrendingDown,
  TrendingUp,
  CalendarDays,
  Users,
} from "lucide-react";

import StatCard from "@/shared/components/molecules/StatCard";

import type { ReportStatMetric } from "../../types/reports.types";

const iconMap = {
  revenue: { Icon: DollarSign, bg: "bg-primary/10", color: "text-primary" },
  bookings: {
    Icon: CalendarDays,
    bg: "bg-[#A17DE8]/10",
    color: "text-[#A17DE8]",
  },
  ticket: { Icon: Scissors, bg: "bg-[#3B9FF7]/10", color: "text-[#3B9FF7]" },
  seat: { Icon: Users, bg: "bg-[#F6AA28]/10", color: "text-[#F6AA28]" },
};

interface ReportStatCardProps {
  metric: ReportStatMetric;
}

const ReportStatCard = ({ metric }: ReportStatCardProps) => {
  const { Icon, bg, color } = iconMap[metric.icon];
  const isUp = metric.trend === "up";

  return (
    <StatCard
      label={metric.label}
      value={metric.value}
      className="rounded-[14px] px-6 py-5 shadow-[0px_2px_4px_0px_#00000012]"
      icon={<Icon className={`h-5 w-5 ${color}`} />}
      iconWrapperClassName={`h-9 w-9 rounded-xl ${bg}`}
      hint={
        <span className="flex items-center gap-1.5">
          {isUp ? (
            <TrendingUp className="h-3 w-3 text-[#171A21]" />
          ) : (
            <TrendingDown className="h-3 w-3 text-[#EB5656]" />
          )}
          <span
            className={`font-semibold ${isUp ? "text-[#171A21]" : "text-[#EB5656]"}`}
          >
            {metric.change}
          </span>
          <span className="text-sm font-normal text-[#8D95A5]">
            vs last period
          </span>
        </span>
      }
    />
  );
};

interface ReportStatsSectionProps {
  metrics: ReportStatMetric[];
}

const ReportStatsSection = ({ metrics }: ReportStatsSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((metric) => (
        <ReportStatCard key={metric.key} metric={metric} />
      ))}
    </div>
  );
};

export default ReportStatsSection;
