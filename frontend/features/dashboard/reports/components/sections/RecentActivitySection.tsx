"use client";

import { Clock } from "lucide-react";

import type { RecentActivityItem } from "../../types/reports.types";

interface RecentActivitySectionProps {
  items: RecentActivityItem[];
}

const RecentActivitySection = ({ items }: RecentActivitySectionProps) => {
  return (
    <div className="flex flex-col rounded-[14px] border border-[#DEE1E7] bg-white p-6 shadow-[0px_2px_4px_0px_#00000012]">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-[#8D95A5]">
        Recent Activity
      </h3>

      <div className="mt-6 flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.key} className="flex items-start gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#DEE1E7]" />
            <div>
              <p className="text-sm font-medium text-[#171A21]">
                {item.action}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8D95A5]">
                <Clock className="h-3 w-3" />
                <span>{item.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivitySection;
