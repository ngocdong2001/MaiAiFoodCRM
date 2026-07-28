import type {
  DayHours,
  IntegrationItem,
  SettingsNavItem,
} from "../types/settings.types";

export const settingsNavItems: SettingsNavItem[] = [
  { key: "business-profile", label: "Business Profile", icon: "building" },
  { key: "operating-hours", label: "Operating Hours", icon: "clock" },
  { key: "integrations", label: "Integrations", icon: "calendar-days" },
  { key: "communications", label: "Communications", icon: "phone-call" },
  { key: "security", label: "Security & Access", icon: "shield-check" },
];

export const defaultOperatingHours: DayHours[] = [
  { day: "Monday", open: false, from: "09:00", to: "17:00" },
  { day: "Tuesday", open: true, from: "09:00", to: "18:00" },
  { day: "Wednesday", open: true, from: "09:00", to: "18:00" },
  { day: "Thursday", open: true, from: "09:00", to: "18:00" },
  { day: "Friday", open: true, from: "09:00", to: "19:00" },
  { day: "Saturday", open: true, from: "10:00", to: "17:00" },
  { day: "Sunday", open: false, from: "10:00", to: "16:00" },
];

export const integrationItems: IntegrationItem[] = [
  {
    key: "google-calendar",
    name: "Google Calendar",
    description: "Sync appointments with Google Calendar automatically.",
    connected: true,
    category: "Calendar",
  },
  {
    key: "square",
    name: "Square Payments",
    description: "Accept payments and track transactions via Square.",
    connected: true,
    category: "Payments",
  },
  {
    key: "mailchimp",
    name: "Mailchimp",
    description: "Send automated marketing emails to your client list.",
    connected: false,
    category: "Marketing",
  },
  {
    key: "quickbooks",
    name: "QuickBooks",
    description: "Export financial data directly to QuickBooks.",
    connected: false,
    category: "Accounting",
  },
  {
    key: "twilio",
    name: "Twilio SMS",
    description: "Send SMS reminders and confirmations to clients.",
    connected: true,
    category: "Communications",
  },
  {
    key: "instagram",
    name: "Instagram",
    description: "Display your latest posts and accept DM bookings.",
    connected: false,
    category: "Social",
  },
];
