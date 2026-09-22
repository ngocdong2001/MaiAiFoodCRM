"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Switch } from "@/shared/components/ui/switch";

import {
  settingsService,
  type DayHours,
} from "../../services/settings.service";

interface OperatingHoursSectionProps {
  initialHours: DayHours[];
}

const DAY_KEY: Record<string, string> = {
  Monday: "monday",
  Tuesday: "tuesday",
  Wednesday: "wednesday",
  Thursday: "thursday",
  Friday: "friday",
  Saturday: "saturday",
  Sunday: "sunday",
};

const OperatingHoursSection = ({
  initialHours,
}: OperatingHoursSectionProps) => {
  const { t } = useTranslation();
  const [hours, setHours] = useState<DayHours[]>(initialHours);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    settingsService
      .getOperatingHours()
      .then(setHours)
      .catch(() => {
        /* keep initialHours on error */
      });
  }, []);

  const updateDay = (index: number, patch: Partial<DayHours>) => {
    setHours((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
    setSaveSuccess(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const saved = await settingsService.updateOperatingHours(hours);
      setHours(saved);
      setSaveSuccess(true);
    } catch {
      setSaveError(t("dashboard.settings.operatingHours.saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#171A21]">
        {t("dashboard.settings.operatingHours.title")}
      </h2>
      <p className="mt-1 text-sm text-[#8D95A5]">
        {t("dashboard.settings.operatingHours.description")}
      </p>

      <div className="mt-6 rounded-[14px] border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
        <div className="divide-y divide-[#DEE1E7]">
          {hours.map((row, i) => (
            <div
              key={row.day}
              className="flex flex-wrap items-center gap-4 px-6 py-4"
            >
              {/* Toggle */}
              <Switch
                checked={row.open}
                onCheckedChange={(v) => updateDay(i, { open: v })}
              />

              {/* Day name */}
              <span className="w-28 text-base font-medium text-[#171A21]">
                {t(
                  `dashboard.settings.operatingHours.days.${DAY_KEY[row.day] ?? row.day}`,
                )}
              </span>

              {/* Time pickers or Closed */}
              {row.open ? (
                <div className="flex w-full items-center gap-3 sm:ml-auto sm:w-auto">
                  <input
                    type="time"
                    value={row.from}
                    onChange={(e) => updateDay(i, { from: e.target.value })}
                    className="min-w-0 flex-1 rounded-[10px] border border-[#DEE1E7] px-3 py-2 text-sm text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] outline-none focus:border-primary sm:flex-none"
                  />
                  <span className="text-sm text-[#8D95A5]">
                    {t("dashboard.settings.operatingHours.to")}
                  </span>
                  <input
                    type="time"
                    value={row.to}
                    onChange={(e) => updateDay(i, { to: e.target.value })}
                    className="min-w-0 flex-1 rounded-[10px] border border-[#DEE1E7] px-3 py-2 text-sm text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] outline-none focus:border-primary sm:flex-none"
                  />
                </div>
              ) : (
                <span className="ml-auto text-sm italic text-[#8D95A5]">
                  {t("dashboard.settings.operatingHours.closed")}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#DEE1E7] bg-[#F3F4F7]/30 px-6 py-3">
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          {saveSuccess && (
            <p className="text-sm text-green-600">
              {t("dashboard.settings.operatingHours.saved")}
            </p>
          )}
          {!saveError && !saveSuccess && <span />}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-[10px] bg-primary px-5 py-2 text-sm font-medium text-white shadow-[0px_1px_3px_0px_#0000001a] hover:opacity-90 disabled:opacity-60"
          >
            {isSaving
              ? t("dashboard.settings.operatingHours.saving")
              : t("dashboard.settings.operatingHours.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OperatingHoursSection;
