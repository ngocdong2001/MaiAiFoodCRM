"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { BookingServiceDataPoint } from "../../types/reports.types";

interface BookingsPieSectionProps {
  data: BookingServiceDataPoint[];
}

const BookingsPieSection = ({ data }: BookingsPieSectionProps) => {
  return (
    <div className="flex flex-col rounded-[14px] border border-[#DEE1E7] bg-white p-6 shadow-[0px_2px_4px_0px_#00000012]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#171A21]">
          Bookings by Service
        </h3>
        <p className="mt-1 text-sm text-[#8D95A5]">
          Distribution of requested services
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[280px] w-full items-center justify-center text-sm text-[#8D95A5]">
          No data available
        </div>
      ) : (
        <>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #DEE1E7",
                    fontSize: 13,
                  }}
                  formatter={(value) => [`${value ?? 0}%`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2">
            {data.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-[#8D95A5]">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-[#171A21]">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BookingsPieSection;
