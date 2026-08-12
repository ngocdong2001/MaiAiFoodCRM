"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Download,
  HandCoins,
  Landmark,
  Package,
  SlidersHorizontal,
  TrendingUp,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import {
  revenueService,
  type RevenueSummaryParams,
  type RevenueSummaryResponse,
} from "../services/revenue.service";

type RevenueFilterDraft = {
  startDate: string;
  endDate: string;
  staffId: string;
  paymentMethod: string;
};

const EMPTY_FILTER_DRAFT: RevenueFilterDraft = {
  startDate: "",
  endDate: "",
  staffId: "",
  paymentMethod: "",
};

const RevenuePage = () => {
  const { t, i18n } = useTranslation();
  const [summary, setSummary] = useState<RevenueSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] =
    useState<RevenueFilterDraft>(EMPTY_FILTER_DRAFT);
  const [appliedFilters, setAppliedFilters] =
    useState<RevenueFilterDraft>(EMPTY_FILTER_DRAFT);

  const buildSummaryParams = (
    draft: RevenueFilterDraft,
  ): RevenueSummaryParams => {
    const staffId =
      draft.staffId.trim() === ""
        ? undefined
        : Number.parseInt(draft.staffId, 10);

    return {
      startDate: draft.startDate || undefined,
      endDate: draft.endDate || undefined,
      staffId: Number.isFinite(staffId) ? staffId : undefined,
      paymentMethod: draft.paymentMethod || undefined,
    };
  };

  const loadSummary = async (params?: RevenueSummaryParams) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await revenueService.getSummary(params);
      setSummary(data);
    } catch {
      setErrorMessage(t("dashboard.revenue.errors.loadSummary"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
  }, []);

  const handleOpenFilters = () => {
    setDraftFilters(appliedFilters);
    setIsFilterOpen(true);
  };

  const handleApplyFilters = async () => {
    const nextAppliedFilters = { ...draftFilters };
    setAppliedFilters(nextAppliedFilters);
    setIsFilterOpen(false);
    await loadSummary(buildSummaryParams(nextAppliedFilters));
  };

  const handleResetFilters = async () => {
    setDraftFilters(EMPTY_FILTER_DRAFT);
    setAppliedFilters(EMPTY_FILTER_DRAFT);
    setIsFilterOpen(false);
    await loadSummary();
  };

  const handleExportExcel = async () => {
    if (!summary) {
      return;
    }

    try {
      const xlsx = await import("xlsx");
      const workbook = xlsx.utils.book_new();

      const metricsSheet = xlsx.utils.json_to_sheet(
        summary.metrics.map((metric) => ({
          metricKey: metric.key,
          metricLabel: metric.label,
          value: metric.value,
          deltaPercent: metric.deltaPercent,
          trend: metric.trend,
        })),
      );

      const staffSheet = xlsx.utils.json_to_sheet(
        summary.staffRevenueRows.map((row) => ({
          staffId: row.key,
          staffName: row.staffName,
          services: row.services,
          tips: row.tips,
          totalRevenue: row.totalRevenue,
        })),
      );

      const paymentMethodSheet = xlsx.utils.json_to_sheet(
        summary.paymentMethods.map((method) => ({
          paymentMethod: method.key,
          label: method.label,
          amount: method.amount,
        })),
      );

      const activitiesSheet = xlsx.utils.json_to_sheet(
        summary.recentRevenueActivities.map((activity) => ({
          activityId: activity.key,
          title: activity.title,
          subtitle: activity.subtitle,
          amount: activity.amount,
          time: activity.time,
        })),
      );

      const filtersSheet = xlsx.utils.json_to_sheet([
        {
          summaryDate: summary.summaryDate,
          startDate: appliedFilters.startDate || "",
          endDate: appliedFilters.endDate || "",
          staffId: appliedFilters.staffId || "",
          paymentMethod: appliedFilters.paymentMethod || "",
        },
      ]);

      xlsx.utils.book_append_sheet(workbook, metricsSheet, "Metrics");
      xlsx.utils.book_append_sheet(workbook, staffSheet, "RevenueByStaff");
      xlsx.utils.book_append_sheet(
        workbook,
        paymentMethodSheet,
        "PaymentMethods",
      );
      xlsx.utils.book_append_sheet(workbook, activitiesSheet, "RecentActivity");
      xlsx.utils.book_append_sheet(workbook, filtersSheet, "Filters");

      const exportDate = new Date().toISOString().slice(0, 10);
      xlsx.writeFile(workbook, `revenue-report-${exportDate}.xlsx`);
    } catch {
      setErrorMessage(t("dashboard.revenue.errors.exportExcel"));
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatDelta = (value: number) =>
    `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;

  const totalPayment = useMemo(() => {
    const metric = summary?.metrics.find(
      (item) => item.key === "total-daily-revenue",
    );
    return metric ? formatCurrency(metric.value) : formatCurrency(0);
  }, [summary]);

  const summaryDateLabel = useMemo(() => {
    if (!summary?.summaryDate) {
      return t("dashboard.shared.sampleDate");
    }

    const locale = i18n.language === "vi" ? "vi-VN" : "en-US";

    return new Date(summary.summaryDate).toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [summary, t, i18n.language]);

  const selectedStaffLabel = useMemo(() => {
    if (!draftFilters.staffId) {
      return t("dashboard.revenue.filters.allStaff");
    }

    const matchedStaff = (summary?.staffRevenueRows ?? []).find(
      (row) => row.key === draftFilters.staffId,
    );

    return matchedStaff?.staffName ?? draftFilters.staffId;
  }, [draftFilters.staffId, summary, t]);

  const selectedPaymentMethodLabel = useMemo(() => {
    if (!draftFilters.paymentMethod) {
      return t("dashboard.revenue.filters.allMethods");
    }

    return t(
      `dashboard.revenue.paymentMethodLabels.${draftFilters.paymentMethod}`,
      {
        defaultValue: draftFilters.paymentMethod,
      },
    );
  }, [draftFilters.paymentMethod, t]);

  return (
    <div className="flex min-h-full flex-col gap-6 px-12 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171A21]">
            {t("dashboard.revenue.title")}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-base text-[#8D95A5]">
            <Calendar className="h-4 w-4" />
            {summaryDateLabel}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleOpenFilters}
            className="h-10 gap-2 rounded-[10px] border-[#DEE1E7] bg-white px-4 py-2 text-sm font-medium text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] hover:bg-[#F9FAFB]"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#8D95A5]" />
            {t("dashboard.revenue.reportFilters")}
          </Button>

          <Button
            type="button"
            onClick={handleExportExcel}
            disabled={!summary || isLoading}
            className="h-10 gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold shadow-[0px_4px_8px_0px_#00000014] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" />
            {t("dashboard.revenue.exportExcel")}
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 gap-3 rounded-[10px] border border-[#DFE1E4] bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm text-[#1D1F23]">
              {t("dashboard.revenue.filters.startDate")}
            </Label>
            <Input
              type="date"
              value={draftFilters.startDate}
              onChange={(event) => {
                setDraftFilters((prev) => ({
                  ...prev,
                  startDate: event.target.value,
                }));
              }}
              className="h-9 rounded-[8px] border-[#DEE1E7] px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm text-[#1D1F23]">
              {t("dashboard.revenue.filters.endDate")}
            </Label>
            <Input
              type="date"
              value={draftFilters.endDate}
              onChange={(event) => {
                setDraftFilters((prev) => ({
                  ...prev,
                  endDate: event.target.value,
                }));
              }}
              className="h-9 rounded-[8px] border-[#DEE1E7] px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm text-[#1D1F23]">
              {t("dashboard.revenue.filters.staff")}
            </Label>
            <Select
              value={draftFilters.staffId || "all"}
              onValueChange={(value) => {
                const nextValue = value ?? "all";
                setDraftFilters((prev) => ({
                  ...prev,
                  staffId: nextValue === "all" ? "" : nextValue,
                }));
              }}
            >
              <SelectTrigger className="h-9 w-full rounded-[8px] border-[#DEE1E7] px-3 text-sm">
                <SelectValue
                  placeholder={t("dashboard.revenue.filters.allStaff")}
                >
                  {selectedStaffLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard.revenue.filters.allStaff")}
                </SelectItem>
                {(summary?.staffRevenueRows ?? []).map((row) => (
                  <SelectItem key={row.key} value={row.key}>
                    {row.staffName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-sm text-[#1D1F23]">
              {t("dashboard.revenue.filters.paymentMethod")}
            </Label>
            <Select
              value={draftFilters.paymentMethod || "all"}
              onValueChange={(value) => {
                const nextValue = value ?? "all";
                setDraftFilters((prev) => ({
                  ...prev,
                  paymentMethod: nextValue === "all" ? "" : nextValue,
                }));
              }}
            >
              <SelectTrigger className="h-9 w-full rounded-[8px] border-[#DEE1E7] px-3 text-sm">
                <SelectValue
                  placeholder={t("dashboard.revenue.filters.allMethods")}
                >
                  {selectedPaymentMethodLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard.revenue.filters.allMethods")}
                </SelectItem>
                {(summary?.paymentMethods ?? []).map((item) => (
                  <SelectItem key={item.key} value={item.key}>
                    {t(`dashboard.revenue.paymentMethodLabels.${item.key}`, {
                      defaultValue: item.label,
                    })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 md:col-span-2 xl:col-span-4">
            <Button
              type="button"
              onClick={() => {
                void handleApplyFilters();
              }}
              className="h-9 rounded-[8px] px-4 py-2 text-sm font-semibold"
            >
              {t("dashboard.revenue.filters.apply")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void handleResetFilters();
              }}
              className="h-9 rounded-[8px] border-[#DEE1E7] bg-white px-4 py-2 text-sm font-semibold text-[#1D1F23]"
            >
              {t("dashboard.revenue.filters.reset")}
            </Button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading && (
        <div className="rounded-[10px] border border-[#DFE1E4] bg-white px-4 py-3 text-sm text-[#8D95A5]">
          {t("dashboard.revenue.loading")}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {(summary?.metrics ?? []).map((metric) => (
          <article
            key={metric.key}
            className="rounded-[10px] border border-[#DFE1E4] bg-[#F6F7F9] p-5 shadow-[0px_2px_4px_0px_#00000012]"
          >
            <div className="flex items-start justify-between">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                {metric.key === "total-daily-revenue" && (
                  <HandCoins className="h-5 w-5" />
                )}
                {metric.key === "service-revenue" && (
                  <Landmark className="h-5 w-5" />
                )}
                {metric.key === "product-revenue" && (
                  <Package className="h-5 w-5" />
                )}
                {metric.key === "total-orders" && (
                  <TrendingUp className="h-5 w-5" />
                )}
              </span>
              <span
                className={
                  metric.trend === "up"
                    ? "inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]"
                    : "inline-flex items-center gap-1 text-xs font-semibold text-[#D64938]"
                }
              >
                {metric.trend === "up" ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {formatDelta(metric.deltaPercent)}
              </span>
            </div>
            <p className="mt-6 text-xs text-[#9DA1A7]">
              {t(`dashboard.revenue.metrics.${metric.key}`, {
                defaultValue: metric.label,
              })}
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#1D1F23]">
              {metric.key === "total-orders"
                ? Math.round(metric.value)
                : formatCurrency(metric.value)}
            </p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_342px]">
        <section className="rounded-[10px] border border-[#DFE1E4] bg-[#F6F7F9] p-4 shadow-[0px_2px_4px_0px_#00000012] sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1D1F23]">
              {t("dashboard.revenue.revenueByStaff")}
            </h2>
            <button className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              {t("dashboard.revenue.viewDetails")}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-[8px] bg-white">
            <table className="w-full min-w-175 border-collapse">
              <thead>
                <tr className="border-b border-[#DFE1E4]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#9DA1A7]">
                    {t("dashboard.revenue.table.staff")}
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-[#9DA1A7]">
                    {t("dashboard.revenue.table.services")}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#9DA1A7]">
                    {t("dashboard.revenue.table.tips")}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#9DA1A7]">
                    {t("dashboard.revenue.table.totalRevenue")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(summary?.staffRevenueRows ?? []).map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-[#DFE1E4] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {row.avatarUrl ? (
                          <img
                            src={row.avatarUrl}
                            alt={row.staffName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <InitialsAvatar name={row.staffName} className="h-10 w-10" />
                        )}
                        <span className="text-sm font-medium text-[#1D1F23]">
                          {row.staffName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-[#1D1F23]">
                      {row.services}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#1D1F23]">
                      {formatCurrency(row.tips)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-primary">
                      {formatCurrency(row.totalRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-[10px] border border-[#DFE1E4] bg-[#F6F7F9] p-6 shadow-[0px_2px_4px_0px_#00000012]">
            <h2 className="text-xl font-semibold uppercase tracking-tight text-[#1D1F23]">
              {t("dashboard.revenue.paymentMethods")}
            </h2>
            <p className="mt-2 text-sm text-[#9DA1A7]">
              {t("dashboard.revenue.paymentDistribution")}
            </p>

            <div className="mt-6 space-y-3">
              {(summary?.paymentMethods ?? []).map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="inline-flex items-center gap-2 text-[#1D1F23]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {t(`dashboard.revenue.paymentMethodLabels.${item.key}`, {
                      defaultValue: item.label,
                    })}
                  </span>
                  <span className="font-medium text-[#1D1F23]">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[#DFE1E4] pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#1D1F23]">
                  {t("dashboard.revenue.total")}
                </span>
                <span className="font-semibold text-primary">
                  {totalPayment}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[10px] border border-[#DFE1E4] bg-[#F6F7F9] p-6 shadow-[0px_2px_4px_0px_#00000012]">
            <h2 className="text-xl font-semibold uppercase tracking-tight text-[#1D1F23]">
              {t("dashboard.revenue.latestActivity")}
            </h2>

            <ul className="mt-5 space-y-4">
              {(summary?.recentRevenueActivities ?? []).map((activity) => (
                <li
                  key={activity.key}
                  className="border-b border-[#DFE1E4] pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EAECEE] text-[#9DA1A7]">
                        <User className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-[#1D1F23]">
                          {activity.isWalkIn
                            ? t("dashboard.revenue.activity.walkInGuest")
                            : activity.title}
                        </p>
                        <p className="text-xs text-[#9DA1A7]">
                          {t("dashboard.revenue.activity.paymentVia", {
                            method: t(
                              `dashboard.revenue.paymentMethodLabels.${activity.paymentMethod}`,
                              { defaultValue: activity.paymentMethod },
                            ),
                          })}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#10B981]">
                          +{formatCurrency(activity.amount)}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-[#9DA1A7]">
                      {new Date(activity.time).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
