"use client";

import {
  Building2,
  CalendarDays,
  Clock,
  PhoneCall,
  ShieldCheck,
  User,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import type { SettingsNavItem, SettingsTab } from "../../types/settings.types";

const iconMap = {
  building: Building2,
  clock: Clock,
  "calendar-days": CalendarDays,
  "phone-call": PhoneCall,
  "shield-check": ShieldCheck,
  user: User,
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
  const { t } = useTranslation();
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
            {t(`dashboard.settings.tabs.${item.label}`)}
          </button>
        );
      })}
    </nav>
  );
};

export default SettingsNavSection;
