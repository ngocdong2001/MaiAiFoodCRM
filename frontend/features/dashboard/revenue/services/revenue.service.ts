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
  recentServiceNames: string[];
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
  serviceTags: string[];
  serviceCount: number;
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

export type StaffRevenueDetailJob = {
  paymentId: number;
  appointmentId: number;
  paidAt: string;
  guestName: string;
  guestAvatarUrl: string | null;
  services: { serviceId: number; serviceName: string; price: number }[];
  amount: number;
  discountAmount: number;
  tipAmount: number;
  finalAmount: number;
  paymentMethod: string;
  receiptNumber: string | null;
  status: string;
  cancelReason: string | null;
  cancelReasonStatus: string | null;
};

export type StaffRevenueDetailResponse = {
  staffId: number;
  staffName: string;
  staffRole: string | null;
  staffAvatarUrl: string | null;
  totalRevenue: number;
  totalTips: number;
  totalJobs: number;
  jobs: StaffRevenueDetailJob[];
};

export const revenueService = {
  async getSummary(params?: RevenueSummaryParams) {
    const response = await apiClient.get<RevenueSummaryResponse>(
      "/revenue/summary",
      { params },
    );
    return response.data;
  },

  async getStaffDetail(
    staffId: string,
    params?: Pick<RevenueSummaryParams, "startDate" | "endDate">,
  ) {
    const response = await apiClient.get<StaffRevenueDetailResponse>(
      `/revenue/staff/${staffId}`,
      { params },
    );
    return response.data;
  },

  async updateCancelReason(recordId: number, cancelReason: string) {
    const response = await apiClient.patch<{ success: boolean; data: { id: number; cancelReason: string; cancelReasonStatus: string } }>(
      `/revenue/record/${recordId}/cancel-reason`,
      { cancelReason },
    );
    return response.data;
  },

  async restoreBooking(recordId: number) {
    const response = await apiClient.patch<{ success: boolean; data: { success: boolean; appointmentId: number } }>(
      `/revenue/record/${recordId}/restore`,
    );
    return response.data;
  },
};
