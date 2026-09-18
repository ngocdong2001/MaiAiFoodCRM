import {
  Bot,
  CalendarDays,
  CalendarPlus,
  Clock,
  Gauge,
  LayoutDashboard,
  Plug,
  Sparkles,
  Users,
} from "lucide-react";

import type {
  DashboardNavItem,
  PlaceholderRoute,
  QueueGuest,
  Recommendation,
  RecentGuest,
  SnapshotItem,
  StatCardData,
} from "../types/dashboard.types";

export const dashboardNavItems: DashboardNavItem[] = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard/overview" },
  { key: "calendar", label: "Calendar", href: "/dashboard/calendar" },
  { key: "crm", label: "CRM", href: "/dashboard/crm" },
  { key: "staff", label: "Staff", href: "/dashboard/staff" },
  {
    key: "services",
    label: "Services",
    href: "/dashboard/services",
    roles: ["admin"],
  },
  // { key: "ai-recs", label: "AI Recs", href: "/dashboard/ai-recs" },
  {
    key: "reports",
    label: "Reports",
    href: "/dashboard/reports",
    roles: ["admin"],
  },
  {
    key: "revenue",
    label: "Revenue",
    href: "/dashboard/revenue",
    roles: ["admin"],
  },
  {
    key: "integrations",
    label: "Settings",
    href: "/dashboard/integrations",
  },
];

export const statCards: StatCardData[] = [
  {
    key: "upcoming-bookings",
    label: "Upcoming Bookings",
    value: "28",
    hint: "+5 today",
    hintTone: "positive",
    icon: CalendarDays,
  },
  {
    key: "seat-utilization",
    label: "Today's Seat Utilization",
    value: "75%",
    hint: "Up 12% from avg",
    hintTone: "positive",
    icon: Gauge,
  },
  {
    key: "active-waitlist",
    label: "Active Waitlist",
    value: "3 Guests",
    hint: "No change",
    hintTone: "muted",
    icon: Users,
  },
  {
    key: "guest-activity",
    label: "Recent Guest Activity",
    value: "15 Check-Ins",
    hint: "Last 24h",
    hintTone: "muted",
    icon: Clock,
  },
];

export const liveQueue: QueueGuest[] = [
  {
    key: "oliver-chen",
    name: "Oliver Chen",
    service: "Walk-in Haircut",
    status: "10 min",
    urgent: false,
  },
  {
    key: "chloe-davis",
    name: "Chloe Davis",
    service: "Color Consult",
    status: "5 min",
    urgent: true,
  },
  {
    key: "liam-white",
    name: "Liam White",
    service: "Shampoo & Blowout",
    status: "Ready",
    urgent: false,
  },
  {
    key: "ava-martinez",
    name: "Ava Martinez",
    service: "Deep Conditioning",
    status: "15 min",
    urgent: false,
  },
  {
    key: "noah-brown",
    name: "Noah Brown",
    service: "Walk-in Trim",
    status: "New",
    urgent: true,
  },
];

export const todaysSnapshot: SnapshotItem[] = [
  {
    key: "haircut-style",
    time: "10:00 AM",
    title: "Haircut & Style with Emily",
    assignee: "Alex Johnson",
  },
  {
    key: "mani-pedi",
    time: "11:30 AM",
    title: "Manicure & Pedicure with Sophia",
    assignee: "Maria Garcia",
  },
  { key: "lunch-break", time: "12:00 PM", title: "Lunch Break (Emily)!" },
  {
    key: "color-treatment",
    time: "01:00 PM",
    title: "Color Treatment with Emily",
    assignee: "Jessica Lee",
  },
  {
    key: "stylist-arrives",
    time: "02:30 PM",
    title: "Stylist Sophia arrives",
    assignee: "Sophia Rodriguez",
  },
];

export const recentGuests: RecentGuest[] = [
  { key: "emily-chen", name: "Emily Chen", meta: "2 hours ago" },
  { key: "david-kim", name: "David Kim", meta: "Yesterday" },
  { key: "sophia-miller", name: "Sophia Miller", meta: "3 days ago" },
  { key: "michael-lee", name: "Michael Lee", meta: "Last week" },
];

export const aiRecommendations: Recommendation[] = [
  {
    key: "upsell-conditioning",
    title: "Upsell: Conditioning Treatment",
    description:
      "Recommend deep conditioning to guests booking hair color services.",
    icon: Sparkles,
  },
  {
    key: "rebook-vip",
    title: "Rebook: VIP Client Discount",
    description:
      "Offer 15% off next visit for clients who haven't booked in 60 days.",
    icon: CalendarPlus,
  },
  {
    key: "upsell-bundle",
    title: "Upsell: Product Bundle",
    description: "Suggest styling product bundles based on past purchases.",
    icon: Sparkles,
  },
  {
    key: "rebook-new-service",
    title: "Rebook: New Service Introduction",
    description: "Promote new keratin treatment to loyal clients.",
    icon: CalendarPlus,
  },
];

export const placeholderRoutes: Record<string, PlaceholderRoute> = {
  calendar: {
    key: "calendar",
    title: "Calendar",
    description: "View and manage all bookings, shifts, and appointments.",
    icon: CalendarDays,
  },
  crm: {
    key: "crm",
    title: "CRM",
    description:
      "Track guest relationships, history, and loyalty in one place.",
    icon: Users,
  },
  staff: {
    key: "staff",
    title: "Staff",
    description: "Manage stylists, schedules, and performance.",
    icon: Users,
  },
  "ai-recs": {
    key: "ai-recs",
    title: "AI Recs",
    description: "Intelligent suggestions to grow revenue and retention.",
    icon: Bot,
  },
  reports: {
    key: "reports",
    title: "Reports",
    description: "Analyze revenue, utilization, and business performance.",
    icon: LayoutDashboard,
  },
  integrations: {
    key: "integrations",
    title: "Integrations",
    description: "Connect calendars, payments, and marketing tools.",
    icon: Plug,
  },
};
