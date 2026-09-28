"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Switch } from "@/shared/components/ui/switch";

const CommunicationsSection = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState({
    bookingConfirmation: true,
    reminderSms: true,
    reminderEmail: true,
    reminderHours: "24",
    followUp: false,
    marketingEmails: false,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#171A21]">
        {t("dashboard.settings.communications.title")}
      </h2>
      <p className="mt-1 text-sm text-[#8D95A5]">
        {t("dashboard.settings.communications.description")}
      </p>

      <div className="mt-6 rounded-[14px] border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
        <div className="divide-y divide-[#DEE1E7]">
          {[
            "bookingConfirmation",
            "reminderSms",
            "reminderEmail",
            "followUp",
            "marketingEmails",
          ].map((key) => (
            <div
              key={key}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium text-[#171A21]">
                  {t(`dashboard.settings.communications.items.${key}.label`)}
                </p>
                <p className="text-xs text-[#8D95A5]">
                  {t(`dashboard.settings.communications.items.${key}.desc`)}
                </p>
              </div>
              <Switch
                checked={settings[key as keyof typeof settings] as boolean}
                onCheckedChange={() => toggle(key as keyof typeof settings)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-[#DEE1E7] bg-[#F3F4F7]/30 px-6 py-3">
          <button className="rounded-[10px] bg-primary px-5 py-2 text-sm font-medium text-white shadow-[0px_1px_3px_0px_#0000001a] hover:opacity-90">
            {t("dashboard.settings.communications.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunicationsSection;
