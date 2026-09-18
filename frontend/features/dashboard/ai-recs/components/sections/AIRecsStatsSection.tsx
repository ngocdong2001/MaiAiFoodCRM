"use client";

import { MessageSquare, Sparkles, TrendingUp, Users } from "lucide-react";

import StatCard from "@/shared/components/molecules/StatCard";

import type { AIStat } from "../../types/ai-recs.types";

const iconMap = {
  "trending-up": TrendingUp,
  "message-square": MessageSquare,
  sparkles: Sparkles,
  users: Users,
};

interface AIRecsStatsSectionProps {
  stats: AIStat[];
}

const AIRecsStatsSection = ({ stats }: AIRecsStatsSectionProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon as keyof typeof iconMap] ?? Sparkles;
        return (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            className="p-6 shadow-sm"
            icon={<Icon className="h-6 w-6 text-primary" />}
            iconWrapperClassName="h-12 w-12 rounded-full bg-primary/10"
            hint={
              <span className="flex items-center gap-1">
                <span className="text-[#171A21]">{stat.delta}</span>
                <span className="font-normal text-[#8D95A5]">
                  {stat.deltaLabel}
                </span>
              </span>
            }
          />
        );
      })}
    </div>
  );
};

export default AIRecsStatsSection;
