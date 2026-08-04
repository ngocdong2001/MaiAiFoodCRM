import { useMemo, useState } from "react";

import WeeklySchedule, {
  type WeeklyScheduleViewMode,
} from "@/shared/components/molecules/WeeklySchedule";

import {
  dailyScheduleHours,
  schedulerAnchorDate,
  schedulerEvents,
  staffMembers,
} from "../../data/data";

const monthShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getWeekStart = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + offset);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const StaffDailyScheduleSection = () => {
  const [viewMode, setViewMode] = useState<WeeklyScheduleViewMode>("day");
  const [cursorDate, setCursorDate] = useState(
    new Date(
      schedulerAnchorDate.year,
      schedulerAnchorDate.month,
      schedulerAnchorDate.day,
    ),
  );

  const rangeLabel = useMemo(() => {
    if (viewMode === "day") {
      return `${monthShort[cursorDate.getMonth()]} ${cursorDate.getDate()}, ${cursorDate.getFullYear()}`;
    }

    const weekStart = getWeekStart(cursorDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${monthShort[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
    }

    return `${monthShort[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthShort[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
  }, [cursorDate, viewMode]);

  const slots = useMemo(() => {
    const dayStart = new Date(cursorDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const weekStart = getWeekStart(cursorDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    return staffMembers
      .map((member) => {
        const memberEvents = schedulerEvents.filter((event) => {
          if (event.resourceKey !== member.key) {
            return false;
          }

          const eventDate = new Date(event.year, event.month, event.day);
          return viewMode === "day"
            ? eventDate >= dayStart && eventDate <= dayEnd
            : eventDate >= weekStart && eventDate <= weekEnd;
        });

        if (memberEvents.length === 0) {
          return null;
        }

        return {
          resourceKey: member.key,
          startHour: Math.min(...memberEvents.map((event) => event.startHour)),
          endHour: Math.max(...memberEvents.map((event) => event.endHour)),
          sublabel: `${memberEvents.length} appt${memberEvents.length > 1 ? "s" : ""}`,
        };
      })
      .filter((slot): slot is NonNullable<typeof slot> => slot !== null);
  }, [cursorDate, viewMode]);

  return (
    <WeeklySchedule
      title="Staff Daily Schedule"
      rangeLabel={rangeLabel}
      hours={dailyScheduleHours}
      resources={staffMembers.map((member) => ({
        key: member.key,
        name: member.name,
        subtitle: member.role,
      }))}
      slots={slots}
      activeViewMode={viewMode}
      viewModes={["day", "week"]}
      onViewModeChange={setViewMode}
      onPrevRange={() => {
        setCursorDate((prev) => {
          const next = new Date(prev);
          next.setDate(prev.getDate() - (viewMode === "day" ? 1 : 7));
          return next;
        });
      }}
      onNextRange={() => {
        setCursorDate((prev) => {
          const next = new Date(prev);
          next.setDate(prev.getDate() + (viewMode === "day" ? 1 : 7));
          return next;
        });
      }}
    />
  );
};

export default StaffDailyScheduleSection;
