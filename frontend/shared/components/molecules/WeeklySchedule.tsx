"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";

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
  activeViewMode?: WeeklyScheduleViewMode;
  viewModes?: WeeklyScheduleViewMode[];
  onViewModeChange?: (mode: WeeklyScheduleViewMode) => void;
};

const formatHour = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${period}`;
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
  activeViewMode,
  viewModes,
  onViewModeChange,
}: WeeklyScheduleProps) => {
  const startHour = hours[0];
  const endHour = hours[hours.length - 1];
  const totalHours = endHour - startHour;

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
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#171A21] hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

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
            <div className="border-r border-[#DEE1E7] px-4 py-4 text-sm font-medium text-[#8D95A5]">
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
            const slot = slots.find(
              (item) => item.resourceKey === resource.key,
            );

            return (
              <div
                key={resource.key}
                className="grid grid-cols-[240px_1fr] border-b border-[#DEE1E7] last:border-b-0"
              >
                <div className="flex items-center gap-3 border-r border-[#DEE1E7] bg-[#F9FAFB] px-4 py-4">
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

                <div className="relative py-4">
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

                  {slot && (
                    <div
                      className="absolute inset-y-2 z-10 mx-1.5 flex flex-col justify-center rounded-lg border border-primary/20 bg-[#FCE7F3] px-2.5 py-1.5 shadow-[0px_2px_4px_0px_#00000012]"
                      style={{
                        left: `${((slot.startHour - startHour) / totalHours) * 100}%`,
                        width: `${((slot.endHour - slot.startHour) / totalHours) * 100}%`,
                        minWidth: "104px",
                      }}
                    >
                      <p className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-primary">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        {slot.label ??
                          `${formatHour(slot.startHour)} - ${formatHour(slot.endHour)}`}
                      </p>
                      {slot.sublabel && (
                        <p className="mt-0.5 whitespace-nowrap text-[10px] text-primary/70">
                          {slot.sublabel}
                        </p>
                      )}
                    </div>
                  )}
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
