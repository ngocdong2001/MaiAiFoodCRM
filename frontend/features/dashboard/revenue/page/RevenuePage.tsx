"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import LoadingState from "@/shared/components/molecules/LoadingState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";

import { StaffRevenueAccordionItem } from "@/shared/components/revenue/StaffRevenueAccordionItem";
import { NULL_TEXT_KEY } from "@/shared/lib/constants";
import { useStaffList } from "@/features/dashboard/staff/hooks/useStaff";

import {
  revenueService,
  type RevenueSummaryParams,
  type RevenueSummaryResponse,
} from "../services/revenue.service";

type RevenueFilterDraft = {
  startDate: string;
  endDate: string;
  staffId: string;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createTodayFilterDraft = (): RevenueFilterDraft => {
  const today = toDateKey(new Date());
  return {
    startDate: today,
    endDate: today,
    staffId: "",
  };
};

const RevenuePage = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<RevenueSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draftFilters, setDraftFilters] = useState<RevenueFilterDraft>(() =>
    createTodayFilterDraft(),
  );
  const [appliedFilters, setAppliedFilters] = useState<RevenueFilterDraft>(() =>
    createTodayFilterDraft(),
  );
  const [staffSearch, setStaffSearch] = useState("");
  const staffFilterQuery = useStaffList({
    date: draftFilters.startDate || toDateKey(new Date()),
  });

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
    queueMicrotask(() => {
      void loadSummary(buildSummaryParams(appliedFilters));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyFilters = async () => {
    const nextApplied = { ...draftFilters };
    setAppliedFilters(nextApplied);
    await loadSummary(buildSummaryParams(nextApplied));
  };

  const handleResetFilters = async () => {
    const todayFilters = createTodayFilterDraft();
    setDraftFilters(todayFilters);
    setAppliedFilters(todayFilters);
    await loadSummary(buildSummaryParams(todayFilters));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const totalRevenue = useMemo(() => {
    const metric = summary?.metrics.find(
      (m) => m.key === "total-daily-revenue",
    );
    return metric?.value ?? 0;
  }, [summary]);

  const totalRevenueDelta = useMemo(() => {
    const metric = summary?.metrics.find(
      (m) => m.key === "total-daily-revenue",
    );
    if (!metric) return null;
    return { percent: metric.deltaPercent, trend: metric.trend };
  }, [summary]);

  const summaryDateLabel = useMemo(() => {
    const formatDate = (value: string) =>
      new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN");

    if (appliedFilters.startDate && appliedFilters.endDate) {
      if (appliedFilters.startDate === appliedFilters.endDate) {
        return formatDate(appliedFilters.startDate);
      }
      return `${formatDate(appliedFilters.startDate)} - ${formatDate(appliedFilters.endDate)}`;
    }

    if (appliedFilters.startDate) return formatDate(appliedFilters.startDate);
    if (appliedFilters.endDate) return formatDate(appliedFilters.endDate);

    if (!summary?.summaryDate) return t("dashboard.shared.sampleDate");
    return new Date(summary.summaryDate).toLocaleDateString("vi-VN");
  }, [appliedFilters.endDate, appliedFilters.startDate, summary, t]);

  const selectedStaffLabel = useMemo(() => {
    if (!draftFilters.staffId) return t("dashboard.revenue.filters.allStaff");
    const match = (staffFilterQuery.data ?? []).find(
      (r) => r.key === draftFilters.staffId,
    );
    return match?.name ?? draftFilters.staffId;
  }, [draftFilters.staffId, staffFilterQuery.data, t]);

  const filteredStaffRows = useMemo(() => {
    const rows = summary?.staffRevenueRows ?? [];
    if (!staffSearch.trim()) return rows;
    const q = staffSearch.toLowerCase();
    return rows.filter((r) => r.staffName.toLowerCase().includes(q));
  }, [summary, staffSearch]);

  // Compute derived stats from existing API data
  const totalOrders = useMemo(
    () => summary?.metrics.find((m) => m.key === "total-orders")?.value ?? 0,
    [summary],
  );

  const avgRevenuePerStaff = useMemo(() => {
    const rows = summary?.staffRevenueRows ?? [];
    if (rows.length === 0) return 0;
    return rows.reduce((acc, r) => acc + r.totalRevenue, 0) / rows.length;
  }, [summary]);

  const mostPopularService = useMemo(() => {
    const freq = new Map<string, number>();
    (summary?.staffRevenueRows ?? []).forEach((r) =>
      (r.recentServiceNames ?? []).forEach((s) =>
        freq.set(s, (freq.get(s) ?? 0) + 1),
      ),
    );
    (summary?.recentRevenueActivities ?? []).forEach((a) =>
      (a.serviceTags ?? []).forEach((s) => freq.set(s, (freq.get(s) ?? 0) + 1)),
    );
    let best = t(NULL_TEXT_KEY);
    let max = 0;
    freq.forEach((count, name) => {
      if (count > max) {
        max = count;
        best = name;
      }
    });
    return best;
  }, [summary, t]);

  return (
    <div className="flex min-h-full flex-col gap-6 px-8 py-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0px_2px_4px_0px_#00000012]">
        <div className="absolute right-0 top-0 h-full w-64 bg-[linear-gradient(270deg,#f04cac0d_0%,transparent_100%)]" />
        <div className="relative px-8 py-8">
          <h1 className="text-[32px] font-bold leading-10 tracking-tight text-[#1A1A1A]">
            {t("dashboard.revenue.title", {
              defaultValue: "Tổng kết doanh thu trong ngày",
            })}{" "}
            {summaryDateLabel}
          </h1>
          <p className="mt-1 text-sm text-[#9DA1A7]">
            {t("dashboard.revenue.subtitle", {
              defaultValue:
                "Theo dõi tình hình tài chính và chi tiết giao dịch khách hàng trong ngày hôm nay.",
            })}
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-[42px] font-bold leading-none tracking-[-1px] text-[#f04cac]">
              {formatCurrency(totalRevenue)}
            </span>
            {totalRevenueDelta && (
              <span
                className={`flex items-center gap-1 text-sm font-semibold ${
                  totalRevenueDelta.trend === "down"
                    ? "text-[#DC2626]"
                    : "text-[#059669]"
                }`}
              >
                {totalRevenueDelta.trend === "down" ? (
                  <ArrowDownRight className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
                {totalRevenueDelta.trend === "down" ? "-" : "+"}
                {Math.abs(totalRevenueDelta.percent).toFixed(1)}%{" "}
                {t("dashboard.revenue.vsYesterday", {
                  defaultValue: "so với hôm qua",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filter panel */}
      <section className="rounded-xl border border-[#DFE1E4] bg-white p-4 shadow-[0px_2px_4px_0px_#0000000d]">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1D1F23]">
          <SlidersHorizontal className="h-4 w-4 text-[#9DA1A7]" />
          {t("dashboard.revenue.reportFilters")}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#1D1F23]">
              {t("dashboard.revenue.filters.startDate")}
            </label>
            <input
              type="date"
              value={draftFilters.startDate}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, startDate: e.target.value }))
              }
              className="h-9 rounded-[8px] border border-[#DEE1E7] px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#1D1F23]">
              {t("dashboard.revenue.filters.endDate")}
            </label>
            <input
              type="date"
              value={draftFilters.endDate}
              onChange={(e) =>
                setDraftFilters((p) => ({ ...p, endDate: e.target.value }))
              }
              className="h-9 rounded-[8px] border border-[#DEE1E7] px-3 text-sm"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#1D1F23]">
              {t("dashboard.revenue.filters.staff")}
            </label>
            <Select
              value={draftFilters.staffId || "all"}
              onValueChange={(v) =>
                setDraftFilters((p) => ({
                  ...p,
                  staffId: v == null || v === "all" ? "" : v,
                }))
              }
            >
              <SelectTrigger className="h-9 w-full rounded-[8px] border-[#DEE1E7] text-sm">
                <SelectValue>{selectedStaffLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("dashboard.revenue.filters.allStaff")}
                </SelectItem>
                {(staffFilterQuery.data ?? []).map((staff) => (
                  <SelectItem key={staff.key} value={staff.key}>
                    {staff.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 md:col-span-2 xl:col-span-1">
            <button
              type="button"
              onClick={() => {
                void handleApplyFilters();
              }}
              className="h-9 rounded-[8px] bg-[#f04cac] px-4 text-sm font-semibold text-white hover:bg-[#e03a9a]"
            >
              {t("dashboard.revenue.filters.apply")}
            </button>
            <button
              type="button"
              onClick={() => {
                void handleResetFilters();
              }}
              className="h-9 rounded-[8px] border border-[#DEE1E7] bg-white px-4 text-sm font-semibold text-[#1D1F23]"
            >
              {t("dashboard.revenue.filters.reset")}
            </button>
          </div>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      {isLoading && (
        <LoadingState
          className="rounded-xl border border-[#DFE1E4] bg-white"
          label={t("dashboard.revenue.loading")}
        />
      )}

      {/* Four Stat Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Tổng khách phục vụ */}
        <div className="rounded-[12px] bg-white p-5 shadow-[0px_2px_4px_0px_#00000012]">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#fff3f8]/80">
              <Users className="h-5 w-5 text-[#f04cac]" />
            </div>
            <span className="flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-medium text-[#059669]">
              {Math.round(totalOrders)}{" "}
              {t("dashboard.revenue.cards.ordersUnit", {
                defaultValue: "hóa đơn",
              })}
            </span>
          </div>
          <p className="mt-5 text-xs text-[#9DA1A7]">
            {t("dashboard.revenue.cards.totalCustomers", {
              defaultValue: "Tổng khách phục vụ",
            })}
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1D1F23]">
            {Math.round(totalOrders)}
            <span className="ml-1 text-base font-normal text-[#9DA1A7]">
              {t("dashboard.revenue.cards.guestUnit", {
                defaultValue: "khách",
              })}
            </span>
          </p>
          <p className="mt-2 text-xs text-[#9DA1A7]">
            {t("dashboard.revenue.cards.totalPaidOrders", {
              defaultValue: "Số lượng hóa đơn đã thanh toán",
            })}
          </p>
        </div>

        {/* Card 2: Doanh thu TB / Nhân viên */}
        <div className="rounded-[12px] bg-white p-5 shadow-[0px_2px_4px_0px_#00000012]">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#fff3f8]/80">
              <DollarSign className="h-5 w-5 text-[#f04cac]" />
            </div>
            {totalRevenueDelta && (
              <span className="flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-medium text-[#059669]">
                +{totalRevenueDelta.percent.toFixed(0)}%
              </span>
            )}
          </div>
          <p className="mt-5 text-xs text-[#9DA1A7]">
            {t("dashboard.revenue.cards.avgPerStaff", {
              defaultValue: "Doanh thu TB / Nhân viên",
            })}
          </p>
          <p className="mt-1 text-2xl font-bold text-[#1D1F23]">
            {formatCurrency(avgRevenuePerStaff)}
          </p>
          <p className="mt-2 text-xs text-[#9DA1A7]">
            {t("dashboard.revenue.cards.avgPerStylist", {
              defaultValue: "Trung bình trên mỗi stylist",
            })}
          </p>
        </div>

        {/* Card 3: Doanh thu trong ngày — PINK background */}
        <div className="rounded-[12px] bg-[#f04cac] p-5 shadow-[0px_2px_4px_0px_#00000012]">
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white/20">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <p className="mt-5 text-xs text-white/80">
            {t("dashboard.revenue.cards.dailyRevenue", {
              defaultValue: "Doanh thu trong ngày",
            })}
          </p>
          <p className="mt-1 text-2xl font-bold text-[#f6f7f9]">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="mt-2 text-xs text-white/70">
            {t("dashboard.revenue.cards.totalReceived", {
              defaultValue: "Tổng tiền thực thu",
            })}
          </p>
        </div>

        {/* Card 4: Dịch vụ phổ biến */}
        <div className="rounded-[12px] bg-white p-5 shadow-[0px_2px_4px_0px_#00000012]">
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#fff3f8]/80">
              <TrendingUp className="h-5 w-5 text-[#f04cac]" />
            </div>
            <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-medium text-[#059669]">
              {t("dashboard.revenue.cards.hot")}
            </span>
          </div>
          <p className="mt-5 text-xs text-[#9DA1A7]">
            {t("dashboard.revenue.cards.popularService", {
              defaultValue: "Dịch vụ phổ biến",
            })}
          </p>
          <p className="mt-1 truncate text-2xl font-bold text-[#1D1F23]">
            {mostPopularService}
          </p>
          <p className="mt-2 text-xs text-[#9DA1A7]">
            {t("dashboard.revenue.cards.chosenMost", {
              defaultValue: "Được chọn nhiều nhất hôm nay",
            })}
          </p>
        </div>
      </div>

      {/* Staff Revenue — Accordion */}
      <div className="rounded-[12px] bg-white shadow-[0px_2px_4px_0px_#00000012]">
        <div className="relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#1A1A1A]">
              {t("dashboard.revenue.staffTable.title")}
            </h2>
            <p className="mt-1 text-sm text-[#9DA1A7]">
              {t("dashboard.revenue.staffTable.subtitle")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 flex-1 items-center gap-2 rounded-[8px] border border-[#DFE1E4] bg-[#F6F7F9] px-3 sm:flex-none">
              <Search className="h-4 w-4 shrink-0 text-[#9DA1A7]" />
              <input
                type="text"
                value={staffSearch}
                onChange={(e) => setStaffSearch(e.target.value)}
                placeholder={t(
                  "dashboard.revenue.staffTable.searchPlaceholder",
                  { defaultValue: "Tìm nhân viên..." },
                )}
                className="w-full min-w-0 bg-transparent text-sm text-[#1A1A1A] placeholder:text-[#9DA1A7] outline-none sm:w-48"
              />
            </div>
          </div>
        </div>
        <div className="border-t border-[#DFE1E4]" />

        <div className="overflow-x-auto">
          <div className="min-w-175">
            {/* Table header row */}
            <div className="flex w-full items-center bg-[#FAFAFA]">
              <div className="w-[320px] shrink-0 flex-1 px-6 py-3 text-left text-[12px] font-medium uppercase tracking-wide text-[#9DA1A7]">
                {t("dashboard.revenue.staffTable.colStaff")}
              </div>
              <div className="w-35 shrink-0 px-4 py-3 text-center text-[12px] font-medium uppercase tracking-wide text-[#9DA1A7]">
                {t("dashboard.revenue.staffTable.colOrders")}
              </div>
              <div className="w-40 shrink-0 px-4 py-3 text-center text-[12px] font-medium uppercase tracking-wide text-[#9DA1A7]">
                {t("dashboard.revenue.staffTable.colRevenue")}
              </div>
            </div>

            <div>
              {filteredStaffRows.map((row) => (
                <StaffRevenueAccordionItem
                  key={row.key}
                  row={row}
                  dateRange={{
                    startDate: appliedFilters.startDate || undefined,
                    endDate: appliedFilters.endDate || undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
