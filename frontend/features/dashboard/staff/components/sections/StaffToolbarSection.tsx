import { Filter, Plus, Search } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

import type { StaffStatus } from "../../types/staff.types";

type StaffToolbarSectionProps = {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: "All" | StaffStatus;
  onStatusFilterChange: (value: "All" | StaffStatus) => void;
};

const filters: Array<"All" | StaffStatus> = [
  "All",
  "Active",
  "Busy",
  "On Leave",
];

const StaffToolbarSection = ({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
}: StaffToolbarSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight text-[#171A21]">
            Staff & Scheduling
          </h1>
          <p className="mt-1 text-base text-[#8D95A5]">
            Manage team roster, shifts, and station assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D95A5]" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search staff..."
              className="h-10 rounded-lg border-[#DEE1E7] bg-[#F9FAFB] pl-9"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(event) =>
                onStatusFilterChange(event.target.value as "All" | StaffStatus)
              }
              className="h-10 appearance-none rounded-lg border border-[#DEE1E7] bg-[#F9FAFB] pl-9 pr-8 text-sm font-medium text-[#171A21] outline-none"
            >
              {filters.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D95A5]" />
          </div>

          <Button className="h-10 gap-2 bg-primary px-4 hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffToolbarSection;
