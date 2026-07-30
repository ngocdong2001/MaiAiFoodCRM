"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { cn } from "@/shared/lib/utils";

export type SchedulerView = "day" | "week" | "month";

export type SchedulerTone = "primary" | "danger" | "muted" | "success" | "info";

export type SchedulerResource = {
  key: string;
  name: string;
  role?: string;
};

export type SchedulerEvent = {
  key: string;
  title: string;
  subtitle?: string;
  resourceKey?: string;
  /** 0-indexed month, matching JavaScript Date. */
  year: number;
  month: number;
  day: number;
  /** Decimal hours in 24h format, e.g. 9 or 14.5. */
  startHour: number;
  endHour: number;
  tone?: SchedulerTone;
};

type CalendarSchedulerProps = {
  events: SchedulerEvent[];
  resources?: SchedulerResource[];
  /** Date the scheduler opens on (deterministic, no reliance on "now"). */
  anchorDate: { year: number; month: number; day: number };
  defaultView?: SchedulerView;
  dayStartHour?: number;
  dayEndHour?: number;
  selectedEventKey?: string;
  onEventSelect?: (key: string, anchorRect?: DOMRect) => void;
  className?: string;
};

type TimeColumn = {
  key: string;
  title: string;
  subtitle?: string;
  avatarName?: string;
  highlight?: boolean;
  date?: Date;
  onHeaderClick?: () => void;
  events: SchedulerEvent[];
};

type TimeGridProps = {
  columns: TimeColumn[];
  dayStartHour: number;
  dayEndHour: number;
  compact?: boolean;
  selectedEventKey?: string;
  onEventSelect?: (key: string, anchorRect?: DOMRect) => void;
};

type MonthViewProps = {
  currentDate: Date;
  eventsByDay: Map<string, SchedulerEvent[]>;
  selectedEventKey?: string;
  onEventSelect?: (key: string, anchorRect?: DOMRect) => void;
  onSelectDay: (date: Date) => void;
};

const VIEW_OPTIONS: { value: SchedulerView; label: string }[] = [
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
];

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAYS_MIN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const HOUR_HEIGHT = 72;
const TIME_COL_WIDTH = 68;
const DEFAULT_DAY_START = 9;
const DEFAULT_DAY_END = 18;

const toneStyles: Record<
  SchedulerTone,
  {
    block: string;
    accent: string;
    dot: string;
    ring: string;
    text: string;
    chip: string;
  }
> = {
  primary: {
    block: "border-[#EEF0F3] bg-white",
    accent: "bg-primary",
    dot: "bg-primary",
    ring: "ring-primary",
    text: "text-primary",
    chip: "bg-primary/10 text-primary",
  },
  danger: {
    block: "border-[#EEF0F3] bg-white",
    accent: "bg-[#E5484D]",
    dot: "bg-[#E5484D]",
    ring: "ring-[#E5484D]",
    text: "text-[#D3383D]",
    chip: "bg-[#FDECEE] text-[#D3383D]",
  },
  muted: {
    block: "border-[#EEF0F3] bg-white",
    accent: "bg-[#8D95A5]",
    dot: "bg-[#8D95A5]",
    ring: "ring-[#8D95A5]",
    text: "text-[#5B6472]",
    chip: "bg-[#F1F2F4] text-[#5B6472]",
  },
  success: {
    block: "border-[#EEF0F3] bg-white",
    accent: "bg-[#2FA35C]",
    dot: "bg-[#2FA35C]",
    ring: "ring-[#2FA35C]",
    text: "text-[#238049]",
    chip: "bg-[#E9F8EE] text-[#238049]",
  },
  info: {
    block: "border-[#EEF0F3] bg-white",
    accent: "bg-[#3B7DE0]",
    dot: "bg-[#3B7DE0]",
    ring: "ring-[#3B7DE0]",
    text: "text-[#2E6BC4]",
    chip: "bg-[#EBF3FD] text-[#2E6BC4]",
  },
};

const toDate = (year: number, month: number, day: number) =>
  new Date(year, month, day);

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const startOfWeek = (date: Date) => addDays(date, -date.getDay());

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const eventDate = (event: SchedulerEvent) =>
  toDate(event.year, event.month, event.day);

const getDateKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

const normalizeDayRange = (startHour: number, endHour: number) => {
  const safeStart = Number.isFinite(startHour)
    ? Math.floor(startHour)
    : DEFAULT_DAY_START;
  const safeEnd = Number.isFinite(endHour)
    ? Math.ceil(endHour)
    : DEFAULT_DAY_END;

  if (safeEnd <= safeStart) {
    return { startHour: DEFAULT_DAY_START, endHour: DEFAULT_DAY_END };
  }

  return { startHour: safeStart, endHour: safeEnd };
};

const sortEventsByTime = (source: SchedulerEvent[]) =>
  [...source].sort((a, b) => {
    if (a.startHour !== b.startHour) return a.startHour - b.startHour;
    if (a.endHour !== b.endHour) return a.endHour - b.endHour;
    return a.title.localeCompare(b.title);
  });

const formatHourLabel = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${period}`;
};

const formatTime = (hour: number) => {
  const wholeHour = Math.floor(hour);
  const minutes = Math.round((hour - wholeHour) * 60);
  const period = wholeHour >= 12 ? "PM" : "AM";
  const display = wholeHour % 12 === 0 ? 12 : wholeHour % 12;
  return `${display}:${String(minutes).padStart(2, "0")} ${period}`;
};

const appointmentCountLabel = (count: number) =>
  `${count} appointment${count === 1 ? "" : "s"}`;

const getNowOffsetTop = (dayStartHour: number, dayEndHour: number) => {
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  if (hour < dayStartHour || hour > dayEndHour) return null;
  return (hour - dayStartHour) * HOUR_HEIGHT;
};

type PositionedEvent = SchedulerEvent & { lane: number; lanes: number };

/**
 * Split overlapping events into side-by-side lanes so they never cover each
 * other. Events are grouped into overlap clusters, then each cluster is packed
 * into the minimum number of lanes.
 */
const layoutColumnEvents = (source: SchedulerEvent[]): PositionedEvent[] => {
  const sorted = sortEventsByTime(source);
  const positioned: PositionedEvent[] = [];
  let index = 0;

  while (index < sorted.length) {
    const cluster: SchedulerEvent[] = [sorted[index]];
    let clusterEnd = sorted[index].endHour;
    let cursor = index + 1;

    while (cursor < sorted.length && sorted[cursor].startHour < clusterEnd) {
      cluster.push(sorted[cursor]);
      clusterEnd = Math.max(clusterEnd, sorted[cursor].endHour);
      cursor += 1;
    }

    const laneEnds: number[] = [];
    const laneOfEvent = new Map<string, number>();

    for (const event of cluster) {
      let lane = laneEnds.findIndex((end) => end <= event.startHour);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(event.endHour);
      } else {
        laneEnds[lane] = event.endHour;
      }
      laneOfEvent.set(event.key, lane);
    }

    for (const event of cluster) {
      positioned.push({
        ...event,
        lane: laneOfEvent.get(event.key) ?? 0,
        lanes: laneEnds.length,
      });
    }

    index = cursor;
  }

  return positioned;
};

const TimeGrid = ({
  columns,
  dayStartHour,
  dayEndHour,
  compact,
  selectedEventKey,
  onEventSelect,
}: TimeGridProps) => {
  const hours = Array.from(
    { length: dayEndHour - dayStartHour + 1 },
    (_, index) => dayStartHour + index,
  );
  const bodyHeight = (dayEndHour - dayStartHour) * HOUR_HEIGHT;
  const minColWidth = compact ? 96 : 132;
  const totalEventCount = columns.reduce(
    (sum, column) => sum + column.events.length,
    0,
  );
  const today = new Date();
  const nowTop = getNowOffsetTop(dayStartHour, dayEndHour);

  return (
    <div className="relative">
      <div className="scrollbar-thin overflow-x-auto">
        <div
          style={{ minWidth: TIME_COL_WIDTH + columns.length * minColWidth }}
          className="min-w-full"
        >
          <div className="max-h-[70vh] overflow-y-auto">
            {/* Column headers */}
            <div className="sticky top-0 z-20 flex border-b border-[#EAEDF1] bg-white">
              <div className="shrink-0" style={{ width: TIME_COL_WIDTH }} />
              {columns.map((column) => (
                <button
                  key={column.key}
                  type="button"
                  onClick={column.onHeaderClick}
                  disabled={!column.onHeaderClick}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-1.5 border-l border-[#EAEDF1] px-2 py-3 transition-colors",
                    column.onHeaderClick && "cursor-pointer hover:bg-[#FAFAFB]",
                    column.highlight && "bg-[#FEF6FB]",
                  )}
                >
                  {column.highlight && (
                    <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
                  )}
                  {column.avatarName && (
                    <InitialsAvatar
                      name={column.avatarName}
                      className={cn(
                        "h-9 w-9 shrink-0 ring-2 ring-white",
                        column.highlight && "ring-[#FBD3E9]",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "line-clamp-2 w-full wrap-break-word px-1 text-sm font-semibold leading-tight",
                      column.highlight ? "text-primary" : "text-[#171A21]",
                    )}
                    title={column.title}
                  >
                    {column.title}
                  </span>
                  {column.subtitle && (
                    <span
                      className={cn(
                        "line-clamp-1 w-full wrap-break-word rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                        column.highlight
                          ? "bg-white text-primary"
                          : "text-[#8D95A5]",
                      )}
                    >
                      {column.subtitle}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Grid body */}
            <div className="flex">
              {/* Hour rail */}
              <div
                className="relative shrink-0 bg-[#FCFDFE]"
                style={{ width: TIME_COL_WIDTH, height: bodyHeight }}
              >
                {hours.slice(0, -1).map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "absolute right-3 flex items-center gap-1 text-[11px] font-medium text-[#9AA1AE]",
                      hour === dayStartHour
                        ? "translate-y-0.5"
                        : "-translate-y-2",
                    )}
                    style={{ top: (hour - dayStartHour) * HOUR_HEIGHT }}
                  >
                    {formatHourLabel(hour)}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {columns.map((column) => (
                <div
                  key={column.key}
                  className={cn(
                    "relative flex-1 border-l border-[#EAEDF1]",
                    column.highlight ? "bg-[#FFFCFE]" : "bg-white",
                  )}
                  style={{ height: bodyHeight }}
                >
                  {/* Hour lines + half-hour guides */}
                  {hours.slice(0, -1).map((hour) => (
                    <div
                      key={hour}
                      className="absolute inset-x-0 border-t border-[#EEF1F5]"
                      style={{ top: (hour - dayStartHour) * HOUR_HEIGHT }}
                    >
                      <div
                        className="border-t border-dashed border-[#F3F5F8]"
                        style={{ marginTop: HOUR_HEIGHT / 2 }}
                      />
                    </div>
                  ))}
                  <div
                    className="absolute inset-x-0 border-t border-[#EEF1F5]"
                    style={{ top: bodyHeight }}
                  />

                  {column.date &&
                    isSameDay(column.date, today) &&
                    nowTop !== null && (
                      <div
                        className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                        style={{ top: nowTop }}
                      >
                        <span className="-ml-1 h-2 w-2 shrink-0 rounded-full bg-[#E5484D]" />
                        <span className="h-px flex-1 bg-[#E5484D]" />
                      </div>
                    )}

                  {column.events.length === 0 && (
                    <div className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-xl border border-dashed border-[#E7EAF0] bg-[#FCFDFE]/80 px-3 py-2 text-center text-[11px] font-medium text-[#B2B8C5]">
                      No appointments
                    </div>
                  )}

                  {layoutColumnEvents(column.events).map((event) => {
                    const tone = toneStyles[event.tone ?? "primary"];
                    const top =
                      (event.startHour - dayStartHour) * HOUR_HEIGHT + 2;
                    const height = Math.max(
                      (event.endHour - event.startHour) * HOUR_HEIGHT - 4,
                      30,
                    );
                    const widthPct = 100 / event.lanes;
                    const leftPct = event.lane * widthPct;
                    const isNarrow = event.lanes > 1;
                    const isSelected = selectedEventKey === event.key;
                    const isShort = height < 52;

                    return (
                      <button
                        key={event.key}
                        type="button"
                        onClick={(clickEvent) =>
                          onEventSelect?.(
                            event.key,
                            clickEvent.currentTarget.getBoundingClientRect(),
                          )
                        }
                        className={cn(
                          "group absolute flex gap-2 overflow-hidden rounded-lg border p-2 text-left shadow-[0px_1px_2px_0px_#0000000d] transition-all duration-150 hover:z-10 hover:-translate-y-0.5 hover:border-[#E4E7EC] hover:shadow-[0px_6px_16px_0px_#00000014]",
                          tone.block,
                          isSelected &&
                            cn(
                              "z-10 ring-2 ring-offset-1 shadow-[0px_6px_16px_0px_#00000014]",
                              tone.ring,
                            ),
                        )}
                        style={{
                          top,
                          height,
                          left: `calc(${leftPct}% + 6px)`,
                          width: `calc(${widthPct}% - ${isNarrow ? 8 : 12}px)`,
                        }}
                      >
                        <span
                          className={cn(
                            "w-1 shrink-0 rounded-full",
                            tone.accent,
                          )}
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-xs font-semibold text-[#171A21]">
                            {event.title}
                          </span>
                          {event.subtitle &&
                            !compact &&
                            !isShort &&
                            !isNarrow && (
                              <span className="truncate text-[11px] text-[#6B7280]">
                                {event.subtitle}
                              </span>
                            )}
                          {!isShort && (
                            <span
                              className={cn(
                                "mt-auto flex w-fit items-center gap-1 truncate rounded-full px-1.5 py-0.5 text-[11px] font-medium",
                                tone.chip,
                              )}
                            >
                              <Clock className="h-3 w-3 shrink-0" />
                              {formatTime(event.startHour)} -{" "}
                              {formatTime(event.endHour)}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {totalEventCount === 0 && (
            <div className="border-t border-[#EAEDF1] px-4 py-3 text-center text-sm text-[#8D95A5]">
              No events scheduled in this range.
            </div>
          )}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-6 bg-linear-to-l from-white to-transparent sm:block" />
    </div>
  );
};

const MonthView = ({
  currentDate,
  eventsByDay,
  selectedEventKey,
  onEventSelect,
  onSelectDay,
}: MonthViewProps) => {
  const monthStart = toDate(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const gridStart = startOfWeek(monthStart);
  const cells = Array.from({ length: 42 }, (_, index) =>
    addDays(gridStart, index),
  );

  return (
    <div className="p-3 sm:p-4">
      <div className="grid grid-cols-7 overflow-hidden rounded-t-xl border border-[#EAEDF1] bg-[#FCFDFE]">
        {WEEKDAYS_SHORT.map((day) => (
          <span
            key={day}
            className="border-l border-[#EAEDF1] py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-[#8D95A5] first:border-l-0"
          >
            {day}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden rounded-b-xl border border-t-0 border-[#EAEDF1]">
        {cells.map((cell, index) => {
          const inMonth = cell.getMonth() === currentDate.getMonth();
          const isSelected = isSameDay(cell, currentDate);
          const isToday = isSameDay(cell, new Date());
          const dayEvents = eventsByDay.get(getDateKey(cell)) ?? [];
          const isTopRow = index < 7;
          const isFirstCol = index % 7 === 0;

          return (
            <div
              key={cell.toISOString()}
              role="button"
              tabIndex={0}
              onClick={() => onSelectDay(cell)}
              onKeyDown={(keyboardEvent) => {
                if (
                  keyboardEvent.key === "Enter" ||
                  keyboardEvent.key === " "
                ) {
                  keyboardEvent.preventDefault();
                  onSelectDay(cell);
                }
              }}
              className={cn(
                "flex min-h-28 cursor-pointer flex-col gap-1.5 p-2 text-left transition-colors hover:bg-[#FAFAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F7C6E4] focus-visible:ring-offset-1",
                !isTopRow && "border-t border-[#EAEDF1]",
                !isFirstCol && "border-l border-[#EAEDF1]",
                !inMonth && "bg-[#FBFBFC]",
                isSelected && !isToday && "bg-[#FFF7FB]",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center self-end rounded-full text-xs font-medium transition-colors",
                  isToday
                    ? "bg-primary font-semibold text-white"
                    : isSelected
                      ? "ring-2 ring-primary text-primary font-semibold"
                      : inMonth
                        ? "text-[#171A21]"
                        : "text-[#C3C8D1]",
                )}
              >
                {cell.getDate()}
              </span>

              <div className="flex flex-col gap-1">
                {dayEvents.slice(0, 3).map((event) => {
                  const tone = toneStyles[event.tone ?? "primary"];

                  return (
                    <button
                      key={event.key}
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onEventSelect?.(
                          event.key,
                          clickEvent.currentTarget.getBoundingClientRect(),
                        );
                      }}
                      className={cn(
                        "flex items-center gap-1.5 truncate rounded-md border px-1.5 py-1 text-[11px] transition-transform hover:scale-[1.01]",
                        tone.block,
                        selectedEventKey === event.key &&
                          cn("ring-1", tone.ring),
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          tone.dot,
                        )}
                      />
                      <span className="truncate font-medium text-[#171A21]">
                        {event.title}
                      </span>
                    </button>
                  );
                })}

                {dayEvents.length > 3 && (
                  <span className="px-1.5 text-[11px] font-medium text-[#8D95A5]">
                    +{dayEvents.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CalendarScheduler = ({
  events,
  resources = [],
  anchorDate,
  defaultView = "day",
  dayStartHour = DEFAULT_DAY_START,
  dayEndHour = DEFAULT_DAY_END,
  selectedEventKey,
  onEventSelect,
  className,
}: CalendarSchedulerProps) => {
  const [view, setView] = useState<SchedulerView>(defaultView);
  const [currentDate, setCurrentDate] = useState<Date>(
    toDate(anchorDate.year, anchorDate.month, anchorDate.day),
  );

  const normalizedRange = useMemo(
    () => normalizeDayRange(dayStartHour, dayEndHour),
    [dayStartHour, dayEndHour],
  );

  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [currentDate]);

  const eventsByDay = useMemo(() => {
    const buckets = new Map<string, SchedulerEvent[]>();

    for (const event of events) {
      const key = getDateKey(eventDate(event));
      const existing = buckets.get(key);
      if (existing) {
        existing.push(event);
      } else {
        buckets.set(key, [event]);
      }
    }

    for (const [key, dayEvents] of buckets.entries()) {
      buckets.set(key, sortEventsByTime(dayEvents));
    }

    return buckets;
  }, [events]);

  const title = useMemo(() => {
    if (view === "day") {
      return `${WEEKDAYS_SHORT[currentDate.getDay()]}, ${MONTHS[currentDate.getMonth()]} ${currentDate.getDate()}`;
    }

    if (view === "week") {
      const start = weekDays[0];
      const end = weekDays[6];

      if (start.getMonth() === end.getMonth()) {
        return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
      }

      return `${MONTHS[start.getMonth()].slice(0, 3)} ${start.getDate()} - ${MONTHS[end.getMonth()].slice(0, 3)} ${end.getDate()}, ${end.getFullYear()}`;
    }

    return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  }, [view, currentDate, weekDays]);

  const shift = (direction: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === "day") next.setDate(next.getDate() + direction);
      else if (view === "week") next.setDate(next.getDate() + direction * 7);
      else next.setMonth(next.getMonth() + direction);
      return next;
    });
  };

  const goToAnchor = () =>
    setCurrentDate(toDate(anchorDate.year, anchorDate.month, anchorDate.day));

  const dayColumns: TimeColumn[] = useMemo(() => {
    const dayEvents = eventsByDay.get(getDateKey(currentDate)) ?? [];
    const columnSource = resources.length
      ? resources
      : [{ key: "all", name: "All Staff" }];

    return columnSource.map((resource) => ({
      key: resource.key,
      title: resource.name,
      subtitle: resource.role,
      avatarName: resource.name,
      date: currentDate,
      events: sortEventsByTime(
        dayEvents.filter(
          (event) =>
            resources.length === 0 || event.resourceKey === resource.key,
        ),
      ),
    }));
  }, [eventsByDay, resources, currentDate]);

  const weekColumns: TimeColumn[] = useMemo(
    () =>
      weekDays.map((date) => ({
        key: date.toISOString(),
        title: WEEKDAYS_MIN[date.getDay()],
        subtitle: `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`,
        highlight: isSameDay(date, currentDate),
        date,
        onHeaderClick: () => {
          setCurrentDate(date);
          setView("day");
        },
        events: eventsByDay.get(getDateKey(date)) ?? [],
      })),
    [weekDays, currentDate, eventsByDay],
  );

  const visibleEventCount = useMemo(() => {
    if (view === "day") {
      return dayColumns.reduce((sum, column) => sum + column.events.length, 0);
    }

    if (view === "week") {
      return weekColumns.reduce((sum, column) => sum + column.events.length, 0);
    }

    return events.filter(
      (event) =>
        event.year === currentDate.getFullYear() &&
        event.month === currentDate.getMonth(),
    ).length;
  }, [view, dayColumns, weekColumns, events, currentDate]);

  return (
    <section
      className={cn(
        "flex min-w-0 flex-col overflow-hidden bg-white",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="border-b border-[#EAEDF1] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBFCFE_100%)] px-4 py-3.5 sm:px-6 sm:py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg border border-[#E4E7EC] bg-white p-0.5 shadow-[0px_1px_2px_0px_#0000000a]">
              <button
                type="button"
                aria-label="Previous"
                onClick={() => shift(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#5B6472] transition-colors hover:bg-[#F4F5F7] hover:text-[#171A21]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => shift(1)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#5B6472] transition-colors hover:bg-[#F4F5F7] hover:text-[#171A21]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-[#171A21] sm:text-lg">
                {title}
              </h1>
              <p className="text-xs font-medium text-[#8D95A5]">
                {appointmentCountLabel(visibleEventCount)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goToAnchor}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E7EC] bg-white px-3 py-1.5 text-xs font-semibold text-[#171A21] shadow-[0px_1px_2px_0px_#0000000a] transition-colors hover:bg-[#F9FAFB]"
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Today
            </button>

            <div className="flex items-center rounded-lg bg-[#F1F3F5] p-1 text-sm font-medium">
              {VIEW_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setView(option.value)}
                  aria-pressed={view === option.value}
                  className={cn(
                    "rounded-md px-3 py-1 transition-colors sm:px-4",
                    view === option.value
                      ? "bg-white text-[#171A21] shadow-[0px_1px_2px_0px_#0000000a]"
                      : "text-[#8D95A5] hover:text-[#171A21]",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      {view === "day" && (
        <TimeGrid
          columns={dayColumns}
          dayStartHour={normalizedRange.startHour}
          dayEndHour={normalizedRange.endHour}
          selectedEventKey={selectedEventKey}
          onEventSelect={onEventSelect}
        />
      )}

      {view === "week" && (
        <TimeGrid
          columns={weekColumns}
          dayStartHour={normalizedRange.startHour}
          dayEndHour={normalizedRange.endHour}
          compact
          selectedEventKey={selectedEventKey}
          onEventSelect={onEventSelect}
        />
      )}

      {view === "month" && (
        <MonthView
          currentDate={currentDate}
          eventsByDay={eventsByDay}
          selectedEventKey={selectedEventKey}
          onEventSelect={onEventSelect}
          onSelectDay={(date) => {
            setCurrentDate(date);
            setView("day");
          }}
        />
      )}
    </section>
  );
};

export default CalendarScheduler;
