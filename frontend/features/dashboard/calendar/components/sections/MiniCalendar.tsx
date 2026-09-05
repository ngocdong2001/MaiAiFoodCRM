import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { useCalendarData } from "../../context/CalendarDataContext";

const MiniCalendar = () => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const { cursorDate, setCursorDate } = useCalendarData();
  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Date(2026, 7, 2 + index).toLocaleDateString(locale, { weekday: "narrow" }),
  );
  const days = Array.from(
    {
      length: new Date(
        cursorDate.getFullYear(),
        cursorDate.getMonth() + 1,
        0,
      ).getDate(),
    },
    (_, index) => index + 1,
  );
  const monthLabel = cursorDate.toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
  return (
    <div className="rounded-xl border border-[#DEE1E7] bg-[#F9FAFB] p-4 shadow-[0px_2px_4px_0px_#00000012]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#171A21]">
          {monthLabel}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label={t("dashboard.calendar.previousMonth")}
            onClick={() =>
              setCursorDate(
                (current) =>
                  new Date(
                    current.getFullYear(),
                    current.getMonth() - 1,
                    1,
                  ),
              )
            }
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#171A21] transition-colors hover:bg-[#EEF0F3]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={t("dashboard.calendar.nextMonth")}
            onClick={() =>
              setCursorDate(
                (current) =>
                  new Date(
                    current.getFullYear(),
                    current.getMonth() + 1,
                    1,
                  ),
              )
            }
            className="flex h-6 w-6 items-center justify-center rounded-md text-[#171A21] transition-colors hover:bg-[#EEF0F3]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-y-2 text-center">
        {weekdays.map((day) => (
          <span key={day} className="text-xs font-medium text-[#8D95A5]">
            {day}
          </span>
        ))}
        {days.map((day) => {
          const selected = day === cursorDate.getDate();
          return (
            <button
              key={day}
              type="button"
              aria-current={selected ? "date" : undefined}
              onClick={() =>
                setCursorDate(
                  new Date(
                    cursorDate.getFullYear(),
                    cursorDate.getMonth(),
                    day,
                  ),
                )
              }
              className={cn(
                "mx-auto flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors",
                selected
                  ? "bg-primary font-semibold text-white"
                  : "text-[#171A21] hover:bg-primary/10",
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
