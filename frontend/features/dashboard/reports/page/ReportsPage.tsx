"use client";

import { Calendar, Download, SlidersHorizontal } from "lucide-react";

import {
  bookingServiceData,
  recentActivityItems,
  reportStatMetrics,
  revenueData,
  savedTemplates,
  seatUtilizationData,
} from "../data/data";
import BookingsPieSection from "../components/sections/BookingsPieSection";
import QuickExportSection from "../components/sections/QuickExportSection";
import RecentActivitySection from "../components/sections/RecentActivitySection";
import ReportStatsSection from "../components/sections/ReportStatsSection";
import RevenueChartSection from "../components/sections/RevenueChartSection";
import SavedTemplatesSection from "../components/sections/SavedTemplatesSection";
import SeatUtilizationSection from "../components/sections/SeatUtilizationSection";

const ReportsPage = () => {
  return (
    <div className="flex min-h-full flex-col gap-6 px-12 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171A21]">
            Reports &amp; Exports
          </h1>
          <p className="mt-1 flex items-center gap-2 text-base text-[#8D95A5]">
            <Calendar className="h-4 w-4" />
            Tuesday, October 14, 2023
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-[10px] border border-[#DEE1E7] bg-white px-4 py-2 text-sm font-medium text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] hover:bg-[#F9FAFB]">
            <SlidersHorizontal className="h-4 w-4 text-[#8D95A5]" />
            Filters
          </button>

          <button className="flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0px_4px_8px_0px_#00000014] hover:opacity-90">
            <Download className="h-4 w-4" />
            Export Data
          </button>
        </div>
      </div>

      <ReportStatsSection metrics={reportStatMetrics} />

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_318px]">
        <div className="flex flex-col gap-6">
          <RevenueChartSection data={revenueData} />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <BookingsPieSection data={bookingServiceData} />
            <SeatUtilizationSection data={seatUtilizationData} />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <QuickExportSection />
          <SavedTemplatesSection templates={savedTemplates} />
          <RecentActivitySection items={recentActivityItems} />
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
