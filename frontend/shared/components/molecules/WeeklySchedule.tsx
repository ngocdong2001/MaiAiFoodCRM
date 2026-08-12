"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";

import ScheduleSlotPopoverContent, {
  type ScheduleSlotWorkItem,
} from "@/shared/components/molecules/ScheduleSlotPopoverContent";
import { Button } from "@/shared/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";

export type WeeklyScheduleResource = {
  key: string;
  name: string;
  subtitle?: string;
  avatarUrl?: string;
};

export type WeeklyScheduleSlot = {
  resourceKey: string;
  startHour: number;
  endHour: number;
  label?: string;
  sublabel?: string;
  color?: string;
  textColor?: string;
  slotType?: "work" | "break";
  note?: string;
  workItems?: ScheduleSlotWorkItem[];
};

type PositionedSlot = WeeklyScheduleSlot & {
  lane: number;
  laneCount: number;
};

export type WeeklyScheduleViewMode = "day" | "week";

type WeeklyScheduleProps = {
  title?: string;
  rangeLabel: string;
  hours: number[];
  resources: WeeklyScheduleResource[];
  slots: WeeklyScheduleSlot[];
  onPrevRange?: () => void;
  onNextRange?: () => void;
  actionLabel?: string;
  onAction?: () => void;
  dateValue?: string;
  onDateChange?: (value: string) => void;
  isLoading?: boolean;
  activeViewMode?: WeeklyScheduleViewMode;
  viewModes?: WeeklyScheduleViewMode[];
  onViewModeChange?: (mode: WeeklyScheduleViewMode) => void;
};

const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const buildCalendarDays = (monthCursor: Date) => {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const startDate = new Date(year, month, 1 - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
};

const formatHour = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${period}`;
};

const positionSlots = (slots: WeeklyScheduleSlot[]): PositionedSlot[] => {
  const sorted = [...slots].sort((left, right) => left.startHour - right.startHour);
  const laneEnds: number[] = [];
  const positioned = sorted.map((slot) => {
    let lane = laneEnds.findIndex((endHour) => endHour <= slot.startHour);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(slot.endHour);
    } else {
      laneEnds[lane] = slot.endHour;
    }

    return { ...slot, lane, laneCount: 1 };
  });

  return positioned.map((slot) => ({ ...slot, laneCount: laneEnds.length }));
};

const WeeklySchedule = ({
  title = "Weekly Schedule Builder",
  rangeLabel,
  hours,
  resources,
  slots,
  onPrevRange,
  onNextRange,
  actionLabel = "Configure Stations",
  onAction,
  dateValue,
  onDateChange,
  isLoading = false,
  activeViewMode,
  viewModes,
  onViewModeChange,
}: WeeklyScheduleProps) => {
  const startHour = hours[0];
  const endHour = hours[hours.length - 1];
  const totalHours = endHour - startHour;
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(
    dateValue ? parseDateKey(dateValue) : new Date(),
  );

  useEffect(() => {
    if (!dateValue) return;
    const selected = parseDateKey(dateValue);
    setMonthCursor(new Date(selected.getFullYear(), selected.getMonth(), 1));
  }, [dateValue]);

  const selectedDate = dateValue ? parseDateKey(dateValue) : null;
  const selectedKey = selectedDate ? toDateKey(selectedDate) : null;
  const currentMonth = monthCursor.getMonth();
  const monthLabel = monthCursor.toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });
  const monthDays = useMemo(() => buildCalendarDays(monthCursor), [monthCursor]);

  return (
    <div className="rounded-xl border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
      <div className="flex flex-col gap-3 border-b border-[#DEE1E7] p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[#171A21]">
          <CalendarDays className="h-5 w-5 text-primary" />
          {title}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          {viewModes && activeViewMode && onViewModeChange && (
            <div className="inline-flex items-center rounded-xl bg-[#EEF1F5] p-1">
              {viewModes.map((mode) => {
                const isActive = mode === activeViewMode;

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onViewModeChange(mode)}
                    className={
                      isActive
                        ? "rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-[#171A21] shadow-[0px_1px_2px_0px_#0000000f]"
                        : "rounded-lg px-3 py-1.5 text-sm font-medium text-[#8D95A5] hover:text-[#171A21]"
                    }
                  >
                    {mode === "day" ? "Day" : "Week"}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-1 rounded-xl border border-[#DEE1E7] bg-[#F9FAFB] px-1.5 py-1 shadow-[0px_2px_4px_0px_#00000012]">
            <button
              type="button"
              aria-label="Previous range"
              onClick={onPrevRange}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#171A21] hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 text-sm font-medium text-[#171A21]">
              {rangeLabel}
            </span>
            <button
              type="button"
              aria-label="Next range"
              onClick={onNextRange}
              disabled={isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#171A21] hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {dateValue && onDateChange ? (
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[#DEE1E7] bg-[#F9FAFB] px-3 text-sm font-medium text-[#171A21]"
                disabled={isLoading}
              >
                <Calendar className="h-4 w-4 text-[#8D95A5]" />
                {dateValue}
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setMonthCursor(
                          (current) =>
                            new Date(
                              current.getFullYear(),
                              current.getMonth() - 1,
                              1,
                            ),
                        )
                      }
                      className="rounded-md p-1 text-[#8D95A5] hover:bg-[#F3F4F7]"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <p className="text-sm font-semibold text-[#171A21]">{monthLabel}</p>
                    <button
                      type="button"
                      onClick={() =>
                        setMonthCursor(
                          (current) =>
                            new Date(
                              current.getFullYear(),
                              current.getMonth() + 1,
                              1,
                            ),
                        )
                      }
                      className="rounded-md p-1 text-[#8D95A5] hover:bg-[#F3F4F7]"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {weekdayLabels.map((label) => (
                      <span
                        key={label}
                        className="text-center text-[11px] font-medium text-[#8D95A5]"
                      >
                        {label}
                      </span>
                    ))}
                    {monthDays.map((day) => {
                      const key = toDateKey(day);
                      const isCurrentMonth = day.getMonth() === currentMonth;
                      const isSelected = key === selectedKey;
                      const isToday = key === toDateKey(new Date());

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            onDateChange(key);
                            setDatePickerOpen(false);
                          }}
                          className={[
                            "h-8 rounded-md text-xs font-medium",
                            isSelected
                              ? "bg-primary text-white"
                              : isCurrentMonth
                                ? "text-[#171A21] hover:bg-[#F3F4F7]"
                                : "text-[#B7BDC9] hover:bg-[#F7F8FA]",
                            isToday && !isSelected ? "ring-1 ring-primary/40" : "",
                          ].join(" ")}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : null}

          {onAction && (
            <Button
              variant="outline"
              onClick={onAction}
              className="h-10 gap-2 border-[#DEE1E7] bg-white px-4 text-[#171A21]"
            >
              <Settings className="h-4 w-4" />
              {actionLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-225">
          <div className="grid grid-cols-[240px_1fr] border-b border-[#DEE1E7] bg-[#F3F4F7]/50">
            <div className="sticky left-0 z-20 border-r border-[#DEE1E7] bg-[#F3F4F7] px-4 py-4 text-sm font-medium text-[#8D95A5]">
              Staff Member
            </div>
            <div
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${hours.length}, minmax(0, 1fr))`,
              }}
            >
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="border-l border-[#DEE1E7]/40 py-4 text-center text-xs font-medium text-[#8D95A5]"
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>
          </div>

          {resources.map((resource) => {
            const resourceSlots = positionSlots(
              slots.filter((item) => item.resourceKey === resource.key),
            );
            const laneCount = resourceSlots[0]?.laneCount ?? 1;
            const rowHeight = Math.max(86, laneCount * 58 + 16);

            return (
              <div
                key={resource.key}
                className="grid grid-cols-[240px_1fr] border-b border-[#DEE1E7] last:border-b-0"
                style={{ minHeight: rowHeight }}
              >
                <div className="sticky left-0 z-20 flex items-center gap-3 border-r border-[#DEE1E7] bg-[#F9FAFB] px-4 py-4">
                  {resource.avatarUrl && (
                    <img
                      src={resource.avatarUrl}
                      alt={resource.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#171A21]">
                      {resource.name}
                    </p>
                    {resource.subtitle && (
                      <p className="truncate text-xs text-[#8D95A5]">
                        {resource.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative overflow-hidden py-4">
                  <div
                    className="pointer-events-none absolute inset-0 grid"
                    style={{
                      gridTemplateColumns: `repeat(${hours.length}, minmax(0, 1fr))`,
                    }}
                  >
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="border-l border-[#DEE1E7]/40"
                      />
                    ))}
                  </div>

                  {resourceSlots.map((slot) => {
                    const accent = slot.color ?? "#F04CAC";
                    const text = slot.textColor ?? "#C91D8F";
                    const primary = slot.label ?? `${formatHour(slot.startHour)} - ${formatHour(slot.endHour)}`;
                    const combinedText = slot.sublabel ? `${primary} • ${slot.sublabel}` : primary;

                    return (
                      <Popover
                        key={`${slot.resourceKey}-${slot.startHour}-${slot.endHour}-${slot.label ?? "slot"}`}
                      >
                        <PopoverTrigger
                          className="absolute z-10 mx-1.5 flex min-w-0 cursor-pointer items-center overflow-hidden rounded-lg border px-2.5 py-1 text-left shadow-[0px_2px_4px_0px_#00000012] outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          style={{
                            left: `${Math.max(0, ((slot.startHour - startHour) / totalHours) * 100)}%`,
                            right: `${Math.max(0, ((endHour - slot.endHour) / totalHours) * 100)}%`,
                            top: 8 + slot.lane * 58,
                            height: 42,
                            backgroundColor: `${accent}1A`,
                            borderColor: `${accent}55`,
                            color: text,
                          }}
                        >
                          <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold" style={{ color: text }}>
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                            <span className="truncate">{combinedText}</span>
                          </span>
                        </PopoverTrigger>
                        <PopoverContent align="start" side="top" className="w-84">
                          <ScheduleSlotPopoverContent
                            staffName={resource.name}
                            staffRole={resource.subtitle}
                            periodLabel={primary}
                            slotType={slot.slotType ?? "work"}
                            note={slot.note}
                            workItems={slot.workItems ?? []}
                          />
                        </PopoverContent>
                      </Popover>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
