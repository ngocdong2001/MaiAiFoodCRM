"use client";

import { MoreVertical } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenueDataPoint } from "../../types/reports.types";

interface RevenueChartSectionProps {
  data: RevenueDataPoint[];
}

const RevenueChartSection = ({ data }: RevenueChartSectionProps) => {
  return (
    <div className="rounded-[14px] border border-[#DEE1E7] bg-white p-6 shadow-[0px_2px_4px_0px_#00000012]">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-[#171A21]">
            Revenue Over Time
          </h3>
          <p className="mt-1 text-sm text-[#8D95A5]">
            Monthly revenue compared to previous period
          </p>
        </div>
        <button className="rounded-[10px] p-2 text-[#8D95A5] hover:bg-[#F3F4F7]">
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[320px] w-full items-center justify-center text-sm text-[#8D95A5]">
          No data available
        </div>
      ) : (
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--primary)"
                  stopOpacity={0.2}
                />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#A17DE8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#A17DE8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#DEE1E7"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8D95A5" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8D95A5" }}
              tickFormatter={(v) => `$${v / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #DEE1E7",
                boxShadow: "0px 2px 4px #00000012",
                fontSize: 13,
              }}
              formatter={(value, name) => [
                `$${Number(value ?? 0).toLocaleString()}`,
                name === "current" ? "This Period" : "Previous Period",
              ]}
            />
            <Legend
              formatter={(value) =>
                value === "current" ? "This Period" : "Previous Period"
              }
              iconType="circle"
              wrapperStyle={{ fontSize: 13, paddingTop: 12 }}
            />
            <Area
              type="monotone"
              dataKey="previous"
              stroke="#A17DE8"
              strokeWidth={2}
              strokeDasharray="5 4"
              fill="url(#colorPrevious)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="current"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#colorCurrent)"
              dot={false}
              activeDot={{ r: 5, fill: "var(--primary)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      )}
    </div>
  );
};

export default RevenueChartSection;
