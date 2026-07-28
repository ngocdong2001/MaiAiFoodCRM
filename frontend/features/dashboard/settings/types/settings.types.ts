export type SettingsTab =
  | "business-profile"
  | "operating-hours"
  | "integrations"
  | "communications"
  | "security";

export interface SettingsNavItem {
  key: SettingsTab;
  label: string;
  icon: string;
}

export interface DayHours {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

export interface IntegrationItem {
  key: string;
  name: string;
  description: string;
  connected: boolean;
  category: string;
}
