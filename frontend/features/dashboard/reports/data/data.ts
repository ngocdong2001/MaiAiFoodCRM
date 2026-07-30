import type {
  BookingServiceDataPoint,
  RecentActivityItem,
  ReportStatMetric,
  RevenueDataPoint,
  SavedTemplate,
  SeatUtilizationDataPoint,
} from "../types/reports.types";

export const reportStatMetrics: ReportStatMetric[] = [
  {
    key: "total-revenue",
    label: "Total Revenue",
    value: "$333,000",
    change: "+12.5%",
    trend: "up",
    icon: "revenue",
  },
  {
    key: "total-bookings",
    label: "Total Bookings",
    value: "2,450",
    change: "+5.2%",
    trend: "up",
    icon: "bookings",
  },
  {
    key: "avg-ticket",
    label: "Avg. Ticket Size",
    value: "$135.92",
    change: "+2.1%",
    trend: "up",
    icon: "ticket",
  },
  {
    key: "seat-utilization",
    label: "Seat Utilization",
    value: "82%",
    change: "-1.4%",
    trend: "down",
    icon: "seat",
  },
];

export const revenueData: RevenueDataPoint[] = [
  { month: "Jan", current: 45000, previous: 38000 },
  { month: "Feb", current: 52000, previous: 42000 },
  { month: "Mar", current: 61000, previous: 50000 },
  { month: "Apr", current: 55000, previous: 48000 },
  { month: "May", current: 68000, previous: 57000 },
  { month: "Jun", current: 74000, previous: 62000 },
];

export const bookingServiceData: BookingServiceDataPoint[] = [
  { name: "Haircut & Styling", value: 45, color: "var(--primary)" },
  { name: "Coloring", value: 30, color: "#A17DE8" },
  { name: "Treatments", value: 15, color: "#3B9FF7" },
  { name: "Extensions", value: 10, color: "#F6AA28" },
];

export const seatUtilizationData: SeatUtilizationDataPoint[] = [
  { day: "Mon", utilization: 72 },
  { day: "Tue", utilization: 85 },
  { day: "Wed", utilization: 78 },
  { day: "Thu", utilization: 91 },
  { day: "Fri", utilization: 95 },
  { day: "Sat", utilization: 88 },
  { day: "Sun", utilization: 60 },
];

export const savedTemplates: SavedTemplate[] = [
  {
    key: "monthly-financial",
    name: "Monthly Financial Summary",
    format: "PDF",
    frequency: "Monthly",
  },
  {
    key: "stylist-performance",
    name: "Stylist Performance Matrix",
    format: "CSV",
    frequency: "Weekly",
  },
  {
    key: "inventory-usage",
    name: "Inventory Usage Report",
    format: "Excel",
    frequency: "Monthly",
  },
  {
    key: "client-retention",
    name: "Client Retention Metrics",
    format: "PDF",
    frequency: "Quarterly",
  },
];

export const recentActivityItems: RecentActivityItem[] = [
  {
    key: "act-1",
    action: "Exported 'Inventory Usage'",
    time: "Today, 9:41 AM",
  },
  {
    key: "act-2",
    action: "Exported 'Stylist Performance Matrix'",
    time: "Today, 8:15 AM",
  },
  {
    key: "act-3",
    action: "Generated 'Monthly Financial Summary'",
    time: "Yesterday, 5:30 PM",
  },
];
