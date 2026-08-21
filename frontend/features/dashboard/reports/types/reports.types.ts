export interface ReportStatMetric {
  key: string;
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: "revenue" | "bookings" | "ticket" | "seat";
}

export interface RevenueDataPoint {
  month: string;
  current: number;
  previous: number;
}

export interface BookingServiceDataPoint {
  name: string;
  value: number;
  color: string;
}

export interface SeatUtilizationDataPoint {
  day: string;
  utilization: number;
}

export interface SavedTemplate {
  key: string;
  name: string;
  format: "PDF" | "CSV" | "Excel";
  frequency: "Monthly" | "Weekly" | "Quarterly";
}

export interface RecentActivityItem {
  key: string;
  action: string;
  time: string;
}

// API response shape from /api/reports/summary
export interface ReportsSummaryData {
  metrics: Array<{
    key: string;
    label: string;
    value: string;
    rawValue: number;
    change: string;
    trend: "up" | "down" | "neutral";
  }>;
  monthlyRevenue: RevenueDataPoint[];
  serviceBreakdown: Array<{ name: string; value: number; count: number }>;
  weeklyUtilization: SeatUtilizationDataPoint[];
}
