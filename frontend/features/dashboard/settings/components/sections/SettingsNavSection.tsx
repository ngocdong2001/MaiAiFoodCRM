"use client";

import {
  Building2,
  CalendarDays,
  Clock,
  LogOut,
  PhoneCall,
  ScrollText,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { authService } from "@/features/landing/services/auth.service";

import type { SettingsNavItem, SettingsTab } from "../../types/settings.types";

const iconMap = {
  building: Building2,
  clock: Clock,
  "calendar-days": CalendarDays,
  "phone-call": PhoneCall,
  "shield-check": ShieldCheck,
  "scroll-text": ScrollText,
  user: User,
  users: Users,
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
  const router = useRouter();

  const handleLogout = () => {
    authService.logout();
    router.replace("/login");
  };

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

      <div className="my-2 border-t border-[#DEE1E7]" />

      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-[10px] px-4 py-2.5 text-sm font-medium text-[#EB5656] transition-colors hover:bg-[#FDF0F0] hover:text-[#D64545]"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {t("dashboard.header.logout")}
      </button>
    </nav>
  );
};

export default SettingsNavSection;
