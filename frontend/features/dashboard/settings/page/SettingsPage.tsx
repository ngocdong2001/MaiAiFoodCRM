"use client";

import { useState } from "react";

import {
  defaultOperatingHours,
  integrationItems,
  settingsNavItems,
} from "../data/data";
import type { SettingsTab } from "../types/settings.types";
import BusinessProfileSection from "../components/sections/BusinessProfileSection";
import CommunicationsSection from "../components/sections/CommunicationsSection";
import IntegrationsSection from "../components/sections/IntegrationsSection";
import OperatingHoursSection from "../components/sections/OperatingHoursSection";
import SecuritySection from "../components/sections/SecuritySection";
import SettingsNavSection from "../components/sections/SettingsNavSection";

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("business-profile");

  return (
    <div className="flex min-h-full px-8 py-8">
      {/* Left sidebar nav */}
      <aside className="w-64 shrink-0 pr-6">
        <h1 className="mb-4 text-lg font-semibold text-[#171A21]">Settings</h1>
        <SettingsNavSection
          items={settingsNavItems}
          active={activeTab}
          onChange={setActiveTab}
        />
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {activeTab === "business-profile" && <BusinessProfileSection />}
        {activeTab === "operating-hours" && (
          <OperatingHoursSection initialHours={defaultOperatingHours} />
        )}
        {activeTab === "integrations" && (
          <IntegrationsSection items={integrationItems} />
        )}
        {activeTab === "communications" && <CommunicationsSection />}
        {activeTab === "security" && <SecuritySection />}
      </main>
    </div>
  );
};

export default SettingsPage;
