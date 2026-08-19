import { apiClient } from "@/core/config/axios.config";
import type { ReportsSummaryData } from "../types/reports.types";

export type ReportsSummaryParams = {
  startDate?: string;
  endDate?: string;
};

export const reportsService = {
  async getSummary(params?: ReportsSummaryParams): Promise<ReportsSummaryData> {
    const response = await apiClient.get<{
      success: boolean;
      data: ReportsSummaryData;
    }>("/reports/summary", { params });
    return response.data.data;
  },
};
