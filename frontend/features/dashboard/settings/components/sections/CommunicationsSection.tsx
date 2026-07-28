"use client";

import { useState } from "react";

const CommunicationsSection = () => {
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

  const Toggle = ({
    checked,
    onToggle,
  }: {
    checked: boolean;
    onToggle: () => void;
  }) => (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-[#F04CAC]" : "bg-[#DEE1E7]"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-md transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#171A21]">Communications</h2>
      <p className="mt-1 text-sm text-[#8D95A5]">
        Configure automated messages sent to your clients.
      </p>

      <div className="mt-6 rounded-[14px] border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
        <div className="divide-y divide-[#DEE1E7]">
          {[
            {
              key: "bookingConfirmation",
              label: "Booking Confirmation",
              desc: "Send confirmation when a booking is made.",
            },
            {
              key: "reminderSms",
              label: "SMS Reminders",
              desc: "Send SMS reminder before the appointment.",
            },
            {
              key: "reminderEmail",
              label: "Email Reminders",
              desc: "Send email reminder before the appointment.",
            },
            {
              key: "followUp",
              label: "Follow-up Message",
              desc: "Send a thank-you message after the appointment.",
            },
            {
              key: "marketingEmails",
              label: "Marketing Emails",
              desc: "Send promotional offers and newsletters.",
            },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium text-[#171A21]">{label}</p>
                <p className="text-xs text-[#8D95A5]">{desc}</p>
              </div>
              <Toggle
                checked={settings[key as keyof typeof settings] as boolean}
                onToggle={() => toggle(key as keyof typeof settings)}
              />
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

export default CommunicationsSection;
