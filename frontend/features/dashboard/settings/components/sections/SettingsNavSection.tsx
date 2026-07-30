"use client";

import {
  Building2,
  CalendarDays,
  Clock,
  PhoneCall,
  ShieldCheck,
} from "lucide-react";

import type { SettingsNavItem, SettingsTab } from "../../types/settings.types";

const iconMap = {
  building: Building2,
  clock: Clock,
  "calendar-days": CalendarDays,
  "phone-call": PhoneCall,
  "shield-check": ShieldCheck,
};

interface SettingsNavSectionProps {
  items: SettingsNavItem[];
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

const SettingsNavSection = ({
  items,
  active,
  onChange,
}: SettingsNavSectionProps) => {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = iconMap[item.icon as keyof typeof iconMap];
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`flex w-full items-center gap-3 rounded-[10px] px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-[#8D95A5] hover:bg-[#F3F4F7] hover:text-[#171A21]"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

export default SettingsNavSection;
