"use client";

import {
  DollarSign,
  Scissors,
  TrendingDown,
  TrendingUp,
  CalendarDays,
  Users,
} from "lucide-react";

import type { ReportStatMetric } from "../../types/reports.types";

const iconMap = {
  revenue: { Icon: DollarSign, bg: "bg-[#F04CAC]/10", color: "text-[#F04CAC]" },
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
    <div className="flex flex-col justify-between rounded-[14px] border border-[#DEE1E7] bg-white px-6 py-5 shadow-[0px_2px_4px_0px_#00000012]">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-[#8D95A5]">
          {metric.label}
        </span>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}
        >
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[#171A21]">
        {metric.value}
      </p>
      <div className="mt-3 flex items-center gap-1.5">
        {isUp ? (
          <TrendingUp className="h-3 w-3 text-[#171A21]" />
        ) : (
          <TrendingDown className="h-3 w-3 text-[#EB5656]" />
        )}
        <span
          className={`text-xs font-semibold ${isUp ? "text-[#171A21]" : "text-[#EB5656]"}`}
        >
          {metric.change}
        </span>
        <span className="text-sm text-[#8D95A5]">vs last period</span>
      </div>
    </div>
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
