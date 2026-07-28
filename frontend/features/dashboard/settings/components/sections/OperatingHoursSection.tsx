"use client";

import { useState } from "react";

import type { DayHours } from "../../types/settings.types";

interface OperatingHoursSectionProps {
  initialHours: DayHours[];
}

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
      checked ? "bg-[#F04CAC]" : "bg-[#DEE1E7]"
    }`}
  >
    <span
      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform ${
        checked ? "translate-x-4" : "translate-x-0.5"
      }`}
    />
  </button>
);

const OperatingHoursSection = ({
  initialHours,
}: OperatingHoursSectionProps) => {
  const [hours, setHours] = useState<DayHours[]>(initialHours);

  const updateDay = (index: number, patch: Partial<DayHours>) => {
    setHours((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#171A21]">Operating Hours</h2>
      <p className="mt-1 text-sm text-[#8D95A5]">
        Define your regular business hours for online booking.
      </p>

      <div className="mt-6 rounded-[14px] border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
        <div className="divide-y divide-[#DEE1E7]">
          {hours.map((row, i) => (
            <div key={row.day} className="flex items-center gap-4 px-6 py-4">
              {/* Toggle */}
              <Toggle
                checked={row.open}
                onChange={(v) => updateDay(i, { open: v })}
              />

              {/* Day name */}
              <span className="w-28 text-base font-medium text-[#171A21]">
                {row.day}
              </span>

              {/* Time pickers or Closed */}
              {row.open ? (
                <div className="ml-auto flex items-center gap-3">
                  <input
                    type="time"
                    value={row.from}
                    onChange={(e) => updateDay(i, { from: e.target.value })}
                    className="rounded-[10px] border border-[#DEE1E7] px-3 py-2 text-sm text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] outline-none focus:border-[#F04CAC]"
                  />
                  <span className="text-sm text-[#8D95A5]">to</span>
                  <input
                    type="time"
                    value={row.to}
                    onChange={(e) => updateDay(i, { to: e.target.value })}
                    className="rounded-[10px] border border-[#DEE1E7] px-3 py-2 text-sm text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] outline-none focus:border-[#F04CAC]"
                  />
                </div>
              ) : (
                <span className="ml-auto text-sm italic text-[#8D95A5]">
                  Closed
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-[#DEE1E7] bg-[#F3F4F7]/30 px-6 py-3">
          <button className="rounded-[10px] bg-[#F04CAC] px-5 py-2 text-sm font-medium text-white shadow-[0px_1px_3px_0px_#0000001a] hover:opacity-90">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperatingHoursSection;
