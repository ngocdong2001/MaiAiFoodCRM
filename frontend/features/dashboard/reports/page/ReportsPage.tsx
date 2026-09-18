"use client";

import { Calendar, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";

import PageHeader from "@/shared/components/molecules/PageHeader";
import LoadingState from "@/shared/components/molecules/LoadingState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { useReportsSummary } from "../hooks/useReports";
import type { ReportsSummaryParams } from "../services/reports.service";
import type {
  BookingServiceDataPoint,
  ReportStatMetric,
} from "../types/reports.types";

import BookingsPieSection from "../components/sections/BookingsPieSection";
import ReportStatsSection from "../components/sections/ReportStatsSection";
import RevenueChartSection from "../components/sections/RevenueChartSection";
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

type ReportsPreset = "today" | "week" | "month" | "all" | "custom";

type ReportsFilterDraft = {
  startDate: string;
  endDate: string;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const addMonths = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
};

const createTodayFilterDraft = (): ReportsFilterDraft => {
  const today = toDateKey(new Date());
  return { startDate: today, endDate: today };
};

const createWeekFilterDraft = (): ReportsFilterDraft => {
  const today = new Date();
  return {
    startDate: toDateKey(addDays(today, -6)),
    endDate: toDateKey(today),
  };
};

const createMonthFilterDraft = (): ReportsFilterDraft => {
  const today = new Date();
  return {
    startDate: toDateKey(addMonths(today, -1)),
    endDate: toDateKey(today),
  };
};

const createAllFilterDraft = (): ReportsFilterDraft => ({
  startDate: "",
  endDate: "",
});

const ReportsPage = () => {
  const { t, i18n } = useTranslation();
  const [preset, setPreset] = useState<ReportsPreset>("today");
  const [draftFilters, setDraftFilters] = useState<ReportsFilterDraft>(
    createTodayFilterDraft,
  );
  const [appliedFilters, setAppliedFilters] = useState<ReportsFilterDraft>(
    createTodayFilterDraft,
  );

  const params: ReportsSummaryParams = {
    startDate: appliedFilters.startDate || undefined,
    endDate: appliedFilters.endDate || undefined,
  };

  const { data: summary, isLoading, isFetching } = useReportsSummary(params);

  // Format today's date according to the active UI language.
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";

  const dateStr = useMemo(() => {
    const formatDate = (value: string) =>
      new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

    if (preset === "all") {
      return t("dashboard.reports.filtersPanel.presetAll");
    }

    if (appliedFilters.startDate && appliedFilters.endDate) {
      if (appliedFilters.startDate === appliedFilters.endDate) {
        return formatDate(appliedFilters.startDate);
      }
      return `${formatDate(appliedFilters.startDate)} – ${formatDate(appliedFilters.endDate)}`;
    }
    if (appliedFilters.startDate) return formatDate(appliedFilters.startDate);
    if (appliedFilters.endDate) return formatDate(appliedFilters.endDate);

    return formatDate(toDateKey(new Date()));
  }, [appliedFilters, locale, preset, t]);

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

  const handlePresetChange = (value: string | null) => {
    if (!value) return;
    const next = value as ReportsPreset;
    setPreset(next);
    if (next === "custom") return;

    let nextDraft: ReportsFilterDraft;
    switch (next) {
      case "week":
        nextDraft = createWeekFilterDraft();
        break;
      case "month":
        nextDraft = createMonthFilterDraft();
        break;
      case "all":
        nextDraft = createAllFilterDraft();
        break;
      case "today":
      default:
        nextDraft = createTodayFilterDraft();
        break;
    }
    setDraftFilters(nextDraft);
    setAppliedFilters(nextDraft);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters });
  };

  return (
    <div className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-6 lg:px-12 lg:py-8">
      <PageHeader
        size="lg"
        title={t("dashboard.reports.title")}
        subtitle={
          <span className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            {dateStr}
          </span>
        }
      />

      <section className="rounded-xl border border-[#DFE1E4] bg-white p-4 shadow-[0px_2px_4px_0px_#0000000d]">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1D1F23]">
          <SlidersHorizontal className="h-4 w-4 text-[#9DA1A7]" />
          {t("dashboard.reports.filtersPanel.title")}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#1D1F23]">
              {t("dashboard.reports.filtersPanel.preset")}
            </label>
            <Select value={preset} onValueChange={handlePresetChange}>
              <SelectTrigger className="h-9 w-full rounded-[8px] border-[#DEE1E7] text-sm">
                <SelectValue>
                  {t(
                    `dashboard.reports.filtersPanel.preset${preset.charAt(0).toUpperCase()}${preset.slice(1)}`,
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">
                  {t("dashboard.reports.filtersPanel.presetToday")}
                </SelectItem>
                <SelectItem value="week">
                  {t("dashboard.reports.filtersPanel.presetWeek")}
                </SelectItem>
                <SelectItem value="month">
                  {t("dashboard.reports.filtersPanel.presetMonth")}
                </SelectItem>
                <SelectItem value="all">
                  {t("dashboard.reports.filtersPanel.presetAll")}
                </SelectItem>
                <SelectItem value="custom">
                  {t("dashboard.reports.filtersPanel.presetCustom")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#1D1F23]">
              {t("dashboard.reports.filtersPanel.startDate")}
            </label>
            <input
              type="date"
              value={draftFilters.startDate}
              onChange={(e) => {
                setPreset("custom");
                setDraftFilters((p) => ({ ...p, startDate: e.target.value }));
              }}
              className="h-9 rounded-[8px] border border-[#DEE1E7] px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#1D1F23]">
              {t("dashboard.reports.filtersPanel.endDate")}
            </label>
            <input
              type="date"
              value={draftFilters.endDate}
              onChange={(e) => {
                setPreset("custom");
                setDraftFilters((p) => ({ ...p, endDate: e.target.value }));
              }}
              className="h-9 rounded-[8px] border border-[#DEE1E7] px-3 text-sm"
            />
          </div>
          <div className="flex gap-2 md:col-span-2 xl:col-span-1">
            <button
              type="button"
              onClick={handleApplyFilters}
              className="h-9 rounded-[8px] bg-primary px-4 text-sm font-semibold text-white hover:opacity-90"
            >
              {t("dashboard.reports.filtersPanel.apply")}
            </button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <LoadingState
          className="rounded-xl border border-[#DFE1E4] bg-white"
          label={t("dashboard.reports.loading")}
        />
      ) : (
        <>
          {isFetching && (
            <LoadingState
              compact
              className="rounded-xl border border-[#DFE1E4] bg-white"
            />
          )}

          <ReportStatsSection metrics={statMetrics} />

          <div className="flex flex-col gap-6">
            <RevenueChartSection data={revenueData} />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <BookingsPieSection data={serviceBreakdown} />
              <SeatUtilizationSection data={utilizationData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportsPage;
