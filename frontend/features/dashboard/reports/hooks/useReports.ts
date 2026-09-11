import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { reportsService } from "../services/reports.service";
import type { ReportsSummaryParams } from "../services/reports.service";

export const useReportsSummary = (params?: ReportsSummaryParams) =>
  useQuery({
    queryKey: ["reports", "summary", params],
    queryFn: () => reportsService.getSummary(params),
    staleTime: 0,
    refetchOnWindowFocus: false,
    placeholderData: keepPreviousData,
  });
