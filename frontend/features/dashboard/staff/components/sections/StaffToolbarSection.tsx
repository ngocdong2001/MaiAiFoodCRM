import { CalendarDays, Plus } from "lucide-react";

import PageHeader from "@/shared/components/molecules/PageHeader";
import SearchInput from "@/shared/components/molecules/SearchInput";
import SelectField from "@/shared/components/molecules/SelectField";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

import type { StaffStatus } from "../../types/staff.types";

type StaffToolbarSectionProps = {
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: "All" | StaffStatus;
  onStatusFilterChange: (value: "All" | StaffStatus) => void;
  selectedDate: string;
  onSelectedDateChange: (value: string) => void;
  onAdd: () => void;
};

const filters: Array<"All" | StaffStatus> = [
  "All",
  "active",
  "busy",
  "on_leave",
];

const filterLabels: Record<"All" | StaffStatus, string> = {
  All: "All",
  active: "Active",
  busy: "Busy",
  on_leave: "On Leave",
};

const StaffToolbarSection = ({
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
  selectedDate,
  onSelectedDateChange,
  onAdd,
}: StaffToolbarSectionProps) => {
  return (
    <PageHeader
      size="lg"
      title="Staff & Scheduling"
      subtitle="Manage team roster, shifts, and station assignments."
      actions={
        <>
          <SearchInput
            value={query}
            onValueChange={onQueryChange}
            placeholder="Search staff..."
            inputClassName="bg-[#F9FAFB]"
          />

          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8D95A5]" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(event) => onSelectedDateChange(event.target.value)}
              className="h-10 rounded-lg border-[#DEE1E7] bg-[#F9FAFB] pl-9"
            />
          </div>

          <div className="relative">
            <SelectField
              value={statusFilter}
              onValueChange={(value) =>
                onStatusFilterChange(value as "All" | StaffStatus)
              }
              options={filters.map((item) => ({
                value: item,
                label: filterLabels[item],
              }))}
              ariaLabel="Filter staff by status"
              className="h-10 w-40 rounded-lg border-[#DEE1E7] bg-[#F9FAFB] px-3 text-sm font-medium text-[#171A21]"
            />
          </div>

          <Button
            type="button"
            onClick={onAdd}
            className="h-10 gap-2 bg-primary px-4 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </Button>
        </>
      }
    />
  );
};

export default StaffToolbarSection;
