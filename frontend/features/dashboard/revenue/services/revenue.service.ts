import { apiClient } from "@/core/config/axios.config";

export type RevenueMetric = {
  key:
    | "total-daily-revenue"
    | "service-revenue"
    | "product-revenue"
    | "total-orders";
  label: string;
  value: number;
  deltaPercent: number;
  trend: "up" | "down";
};

export type StaffRevenueRow = {
  key: string;
  staffName: string;
  services: number;
  tips: number;
  totalRevenue: number;
  avatarUrl: string | null;
};

export type PaymentMethodItem = {
  key: string;
  label: string;
  amount: number;
  color: string;
};

export type RevenueActivity = {
  key: string;
  title: string;
  subtitle: string;
  paymentMethod: string;
  amount: number;
  time: string;
  isWalkIn: boolean;
};

export type RevenueSummaryResponse = {
  summaryDate: string;
  metrics: RevenueMetric[];
  staffRevenueRows: StaffRevenueRow[];
  paymentMethods: PaymentMethodItem[];
  recentRevenueActivities: RevenueActivity[];
};

export type RevenueSummaryParams = {
  startDate?: string;
  endDate?: string;
  staffId?: number;
  paymentMethod?: string;
};

export const revenueService = {
  async getSummary(params?: RevenueSummaryParams) {
    const response = await apiClient.get<RevenueSummaryResponse>(
      "/revenue/summary",
      { params },
    );
    return response.data;
  },
};
