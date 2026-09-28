"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { SeatUtilizationDataPoint } from "../../types/reports.types";

interface SeatUtilizationSectionProps {
  data: SeatUtilizationDataPoint[];
}

const SeatUtilizationSection = ({ data }: SeatUtilizationSectionProps) => {
  return (
    <div className="flex flex-col rounded-[14px] border border-[#DEE1E7] bg-white p-6 shadow-[0px_2px_4px_0px_#00000012]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#171A21]">
          Weekly Seat Utilization
        </h3>
        <p className="mt-1 text-sm text-[#8D95A5]">
          Average occupancy rates by day
        </p>
      </div>

      <div className="h-[280px] w-full">
        {data.length === 0 ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#8D95A5]">
            No data available
          </div>
        ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#DEE1E7"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8D95A5" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#8D95A5" }}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #DEE1E7",
                fontSize: 13,
              }}
              formatter={(value) => [`${Number(value ?? 0)}%`, "Utilization"]}
            />
            <Bar dataKey="utilization" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry) => (
                <Cell
                  key={entry.day}
                  fill={entry.utilization >= 90 ? "var(--primary)" : "#A17DE8"}
                  fillOpacity={entry.utilization >= 90 ? 1 : 0.75}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SeatUtilizationSection;
