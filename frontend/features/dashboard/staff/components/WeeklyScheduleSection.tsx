"use client";

import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import type { WeeklySchedule, WeeklyScheduleDay } from "../types/staff.types";

type WeeklyScheduleSectionProps = {
  weeklySchedule: WeeklySchedule | null;
  onChange: (schedule: WeeklySchedule | null) => void;
};

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_LABELS: Record<(typeof DAYS)[number], string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DEFAULT_WORKDAY: WeeklyScheduleDay = {
  active: true,
  startTime: "09:00",
  endTime: "17:00",
  breakStart: "12:00",
  breakEnd: "13:00",
  station: null,
};

const DEFAULT_DAYOFF: WeeklyScheduleDay = {
  active: false,
};

const getDefaultSchedule = (): WeeklySchedule => ({
  monday: DEFAULT_WORKDAY,
  tuesday: DEFAULT_WORKDAY,
  wednesday: DEFAULT_WORKDAY,
  thursday: DEFAULT_WORKDAY,
  friday: DEFAULT_WORKDAY,
  saturday: DEFAULT_DAYOFF,
  sunday: DEFAULT_DAYOFF,
});

export const WeeklyScheduleSection = ({
  weeklySchedule,
  onChange,
}: WeeklyScheduleSectionProps) => {
  const schedule = weeklySchedule || getDefaultSchedule();

  const updateDay = (day: (typeof DAYS)[number], updates: Partial<WeeklyScheduleDay>) => {
    const updated = {
      ...schedule,
      [day]: { ...schedule[day], ...updates },
    };
    onChange(updated);
  };

  const copyWorkdayToWeekdays = () => {
    const workday = schedule.monday;
    const updated = { ...schedule };
    for (const day of ["tuesday", "wednesday", "thursday", "friday"] as const) {
      updated[day] = { ...workday };
    }
    onChange(updated);
  };

  const copyToAll = () => {
    const reference = schedule.monday;
    const updated = DAYS.reduce(
      (acc, day) => {
        acc[day] = { ...reference };
        return acc;
      },
      {} as WeeklySchedule,
    );
    onChange(updated);
  };

  return (
    <fieldset className="rounded-lg border border-[#DEE1E7] p-4">
      <legend className="px-1 text-sm font-semibold">Weekly Schedule</legend>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={copyWorkdayToWeekdays}
          className="rounded-md bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
        >
          Copy Mon → Fri
        </button>
        <button
          type="button"
          onClick={copyToAll}
          className="rounded-md bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200"
        >
          Copy to All Days
        </button>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => (
          <DayRow
            key={day}
            day={day}
            label={DAY_LABELS[day]}
            config={schedule[day]}
            onUpdate={(updates) => updateDay(day, updates)}
          />
        ))}
      </div>
    </fieldset>
  );
};

type DayRowProps = {
  day: string;
  label: string;
  config: WeeklyScheduleDay;
  onUpdate: (updates: Partial<WeeklyScheduleDay>) => void;
};

const DayRow = ({ day, label, config, onUpdate }: DayRowProps) => {
  const isActive = config.active;

  return (
    <div className="rounded-md border border-[#E5E7EB] bg-gray-50 p-3">
      <div className="mb-3 flex items-center gap-3">
        <input
          type="checkbox"
          id={`active-${day}`}
          checked={isActive}
          onChange={(e) => {
            onUpdate({
              active: e.target.checked,
              startTime: e.target.checked ? DEFAULT_WORKDAY.startTime : undefined,
              endTime: e.target.checked ? DEFAULT_WORKDAY.endTime : undefined,
            });
          }}
          className="h-4 w-4 cursor-pointer"
        />
        <label htmlFor={`active-${day}`} className="cursor-pointer font-medium text-sm">
          {label}
        </label>
        {!isActive && <span className="text-xs text-gray-500">(Day off)</span>}
      </div>

      {isActive && (
        <div className="grid gap-2 sm:grid-cols-4">
          <DayInput
            label="Start"
            type="time"
            value={config.startTime || "09:00"}
            onChange={(value) => onUpdate({ startTime: value })}
          />
          <DayInput
            label="End"
            type="time"
            value={config.endTime || "17:00"}
            onChange={(value) => onUpdate({ endTime: value })}
          />
          <DayInput
            label="Break start"
            type="time"
            value={config.breakStart || ""}
            onChange={(value) => onUpdate({ breakStart: value || null })}
          />
          <DayInput
            label="Break end"
            type="time"
            value={config.breakEnd || ""}
            onChange={(value) => onUpdate({ breakEnd: value || null })}
          />
        </div>
      )}
    </div>
  );
};

type DayInputProps = {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
};

const DayInput = ({ label, type, value, onChange }: DayInputProps) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <Input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-sm"
    />
  </div>
);
