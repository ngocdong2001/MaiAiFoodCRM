"use client";

import { MessageSquare, Sparkles, TrendingUp, Users } from "lucide-react";

import type { AIStat } from "../../types/ai-recs.types";

const iconMap = {
  "trending-up": TrendingUp,
  "message-square": MessageSquare,
  sparkles: Sparkles,
  users: Users,
};

interface AIRecsStatCardProps {
  stat: AIStat;
}

const AIRecsStatCard = ({ stat }: AIRecsStatCardProps) => {
  const Icon = iconMap[stat.icon as keyof typeof iconMap] ?? Sparkles;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-[#8D95A5]">{stat.label}</span>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FEF1F8]">
          <Icon className="h-6 w-6 text-[#F04CAC]" />
        </div>
      </div>
      <span className="text-3xl font-bold tracking-tight text-[#171A21]">
        {stat.value}
      </span>
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-[#171A21]">{stat.delta}</span>
        <span className="text-xs text-[#8D95A5]">{stat.deltaLabel}</span>
      </div>
    </div>
  );
};

interface AIRecsStatsSectionProps {
  stats: AIStat[];
}

const AIRecsStatsSection = ({ stats }: AIRecsStatsSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <AIRecsStatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
};

export default AIRecsStatsSection;
