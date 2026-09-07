"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";

import { defaultOperatingHours, settingsNavItems } from "../data/data";
import type { SettingsTab } from "../types/settings.types";
import BusinessProfileSection from "../components/sections/BusinessProfileSection";
import CommunicationsSection from "../components/sections/CommunicationsSection";
import OperatingHoursSection from "../components/sections/OperatingHoursSection";
import SecuritySection from "../components/sections/SecuritySection";
import SettingsNavSection from "../components/sections/SettingsNavSection";
import SystemLogsSection from "../components/sections/SystemLogsSection";
import UserProfileSection from "../components/sections/UserProfileSection";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";

const SettingsPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>("user-profile");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleChange = (tab: SettingsTab) => {
    setActiveTab(tab);
    setIsDrawerOpen(false);
  };

  const activeLabel = settingsNavItems.find(
    (item) => item.key === activeTab,
  )?.label;

  return (
    <div className="flex min-h-full flex-col px-4 py-6 sm:px-6 lg:flex-row lg:px-8 lg:py-8">
      {/* Mobile: trigger button to open nav drawer */}
      <div className="mb-4 lg:hidden">
        <Drawer
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          swipeDirection="left"
        >
          <DrawerTrigger
            aria-label={t("dashboard.settings.title")}
            className="flex w-full items-center justify-between gap-3 rounded-[10px] border border-[#DEE1E7] bg-white px-4 py-2.5 text-sm font-medium text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] transition-colors hover:bg-[#F3F4F6]"
          >
            <span className="flex items-center gap-2">
              <Menu className="h-4 w-4" />
              {activeLabel
                ? t(`dashboard.settings.tabs.${activeLabel}`)
                : t("dashboard.settings.title")}
            </span>
            <X className="hidden" />
          </DrawerTrigger>
          <DrawerContent
            className="bg-[#F9FAFB]"
            aria-describedby="settings-mobile-nav-description"
          >
            <DrawerHeader className="border-b border-[#DEE1E7] px-5 py-4 text-left">
              <div className="flex items-center justify-between gap-4">
                <DrawerTitle className="text-lg font-bold text-primary">
                  {t("dashboard.settings.title")}
                </DrawerTitle>
                <button
                  type="button"
                  aria-label={t("dashboard.settings.closeMenu")}
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#DEE1E7] bg-white text-[#171A21] transition-colors hover:bg-[#F3F4F6]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </DrawerHeader>

            <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-6">
              <SettingsNavSection
                items={settingsNavItems}
                active={activeTab}
                onChange={handleChange}
              />
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Left sidebar nav — desktop only */}
      <aside className="hidden shrink-0 lg:block lg:w-64 lg:pr-6">
        <h1 className="mb-4 text-lg font-semibold text-[#171A21]">
          {t("dashboard.settings.title")}
        </h1>
        <SettingsNavSection
          items={settingsNavItems}
          active={activeTab}
          onChange={setActiveTab}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {activeTab === "user-profile" && <UserProfileSection />}
        {activeTab === "business-profile" && <BusinessProfileSection />}
        {activeTab === "operating-hours" && (
          <OperatingHoursSection initialHours={defaultOperatingHours} />
        )}
        {activeTab === "communications" && <CommunicationsSection />}
        {activeTab === "security" && <SecuritySection />}
        {activeTab === "system-logs" && <SystemLogsSection />}
      </main>
    </div>
  );
};

export default SettingsPage;
