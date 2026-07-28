import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { miniCalendar } from "@/features/dashboard/calendar/data/data";

const MiniCalendar = () => {
  return (
    <div className="rounded-xl border border-[#DEE1E7] bg-[#F9FAFB] p-4 shadow-[0px_2px_4px_0px_#00000012]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#171A21]">
          {miniCalendar.monthLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous month"
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#171A21] transition-colors hover:bg-[#EEF0F3]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next month"
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#171A21] transition-colors hover:bg-[#EEF0F3]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-2 text-center">
        {miniCalendar.weekdays.map((day) => (
          <span key={day} className="text-xs font-medium text-[#8D95A5]">
            {day}
          </span>
        ))}
        {miniCalendar.days.map((day) => {
          const selected = day === miniCalendar.selectedDay;
          return (
            <button
              key={day}
              type="button"
              aria-current={selected ? "date" : undefined}
              className={cn(
                "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors",
                selected
                  ? "bg-[#F04CAC] font-semibold text-white"
                  : "text-[#171A21] hover:bg-[#FEF1F8]",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
