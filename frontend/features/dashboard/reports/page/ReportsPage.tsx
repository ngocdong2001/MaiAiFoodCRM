"use client";

import { Calendar, Download, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

import PageHeader from "@/shared/components/molecules/PageHeader";
import LoadingState from "@/shared/components/molecules/LoadingState";

import { savedTemplates, recentActivityItems } from "../data/data";
import { useReportsSummary } from "../hooks/useReports";
import type {
  BookingServiceDataPoint,
  ReportStatMetric,
} from "../types/reports.types";

import BookingsPieSection from "../components/sections/BookingsPieSection";
import QuickExportSection from "../components/sections/QuickExportSection";
import RecentActivitySection from "../components/sections/RecentActivitySection";
import ReportStatsSection from "../components/sections/ReportStatsSection";
import RevenueChartSection from "../components/sections/RevenueChartSection";
import SavedTemplatesSection from "../components/sections/SavedTemplatesSection";
import SeatUtilizationSection from "../components/sections/SeatUtilizationSection";

const ICON_KEYS = ["revenue", "bookings", "ticket", "seat"] as const;
const SERVICE_COLORS = [
  "var(--primary)",
  "#A17DE8",
  "#3B9FF7",
  "#F6AA28",
  "#34D399",
  "#F87171",
];

const ReportsPage = () => {
  const { t } = useTranslation();
  const { data: summary, isLoading } = useReportsSummary();

  const statMetrics: ReportStatMetric[] = useMemo(() => {
    if (!summary) return [];
    return summary.metrics.map((m, i) => ({
      key: m.key,
      label: m.label,
      value: m.value,
      change: m.change,
      trend: m.trend === "neutral" ? "down" : m.trend,
      icon: ICON_KEYS[i] ?? "revenue",
    }));
  }, [summary]);

  const revenueData = useMemo(() => summary?.monthlyRevenue ?? [], [summary]);

  const serviceBreakdown: BookingServiceDataPoint[] = useMemo(() => {
    if (!summary) return [];
    return summary.serviceBreakdown.map((s, i) => ({
      name: s.name,
      value: s.value,
      color: SERVICE_COLORS[i % SERVICE_COLORS.length],
    }));
  }, [summary]);

  const utilizationData = useMemo(
    () => summary?.weeklyUtilization ?? [],
    [summary],
  );

  return (
    <div className="flex min-h-full flex-col gap-6 px-12 py-8">
      <PageHeader
        size="lg"
        title={t("dashboard.reports.title")}
        subtitle={
          <span className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            {t("dashboard.shared.sampleDate")}
          </span>
        }
        actions={
          <>
            <button className="flex items-center gap-2 rounded-[10px] border border-[#DEE1E7] bg-white px-4 py-2 text-sm font-medium text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] hover:bg-[#F9FAFB]">
              <SlidersHorizontal className="h-4 w-4 text-[#8D95A5]" />
              {t("dashboard.reports.filters")}
            </button>

            <button className="flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0px_4px_8px_0px_#00000014] hover:opacity-90">
              <Download className="h-4 w-4" />
              {t("dashboard.reports.exportData")}
            </button>
          </>
        }
      />

      {isLoading ? (
        <LoadingState
          className="rounded-xl border border-[#DFE1E4] bg-white"
          label={t("dashboard.reports.loading")}
        />
      ) : (
        <>
          <ReportStatsSection metrics={statMetrics} />

          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_318px]">
            <div className="flex flex-col gap-6">
              <RevenueChartSection data={revenueData} />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <BookingsPieSection data={serviceBreakdown} />
                <SeatUtilizationSection data={utilizationData} />
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <QuickExportSection />
              <SavedTemplatesSection templates={savedTemplates} />
              <RecentActivitySection items={recentActivityItems} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
