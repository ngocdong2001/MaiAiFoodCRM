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

import {
  dailyRevenueMetrics,
  paymentMethods,
  recentRevenueActivities,
  staffRevenueRows,
} from "../data/data";

const RevenuePage = () => {
  const totalPayment = "$12,450";

  return (
    <div className="flex min-h-full flex-col gap-6 px-12 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#171A21]">
            Daily Revenue Summary
          </h1>
          <p className="mt-1 flex items-center gap-2 text-base text-[#8D95A5]">
            <Calendar className="h-4 w-4" />
            Tuesday, October 14, 2023
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-[10px] border border-[#DEE1E7] bg-white px-4 py-2 text-sm font-medium text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] hover:bg-[#F9FAFB]">
            <SlidersHorizontal className="h-4 w-4 text-[#8D95A5]" />
            Report Filters
          </button>

          <button className="flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2 text-sm font-semibold text-white shadow-[0px_4px_8px_0px_#00000014] hover:opacity-90">
            <Download className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {dailyRevenueMetrics.map((metric) => (
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
                {metric.delta}
              </span>
            </div>
            <p className="mt-6 text-xs text-[#9DA1A7]">{metric.label}</p>
            <p className="mt-1 text-2xl font-semibold text-[#1D1F23]">
              {metric.value}
            </p>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_342px]">
        <section className="rounded-[10px] border border-[#DFE1E4] bg-[#F6F7F9] p-4 shadow-[0px_2px_4px_0px_#00000012] sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#1D1F23]">
              Revenue by Staff
            </h2>
            <button className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              View details
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto rounded-[8px] bg-white">
            <table className="w-full min-w-175 border-collapse">
              <thead>
                <tr className="border-b border-[#DFE1E4]">
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#9DA1A7]">
                    Staff
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-[#9DA1A7]">
                    Services
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#9DA1A7]">
                    Tips
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-[#9DA1A7]">
                    Total Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {staffRevenueRows.map((row) => (
                  <tr
                    key={row.key}
                    className="border-b border-[#DFE1E4] last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={row.avatarUrl}
                          alt={row.staffName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-[#1D1F23]">
                          {row.staffName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-[#1D1F23]">
                      {row.services}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[#1D1F23]">
                      {row.tips}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-primary">
                      {row.totalRevenue}
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
              Payment Methods
            </h2>
            <p className="mt-2 text-sm text-[#9DA1A7]">
              Daily payment distribution
            </p>

            <div className="mt-6 space-y-3">
              {paymentMethods.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="inline-flex items-center gap-2 text-[#1D1F23]">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.label}
                  </span>
                  <span className="font-medium text-[#1D1F23]">
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-[#DFE1E4] pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#1D1F23]">Total</span>
                <span className="font-semibold text-primary">{totalPayment}</span>
              </div>
            </div>
          </section>

          <section className="rounded-[10px] border border-[#DFE1E4] bg-[#F6F7F9] p-6 shadow-[0px_2px_4px_0px_#00000012]">
            <h2 className="text-xl font-semibold uppercase tracking-tight text-[#1D1F23]">
              Latest Activity
            </h2>

            <ul className="mt-5 space-y-4">
              {recentRevenueActivities.map((activity) => (
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
                          {activity.title}
                        </p>
                        <p className="text-xs text-[#9DA1A7]">
                          {activity.subtitle}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-[#10B981]">
                          {activity.amount}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-[#9DA1A7]">{activity.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <footer className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-[#DFE1E4] pt-4 text-xs text-[#9DA1A7]">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            Ready for export
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10B981]" />
            System synced
          </span>
        </div>
        <span>© 2023 MaiAI Salon Management System • Version 2.4.0</span>
      </footer>
    </div>
  );
};

export default RevenuePage;
