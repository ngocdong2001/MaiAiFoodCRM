import { ChevronRight } from "lucide-react";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { cn } from "@/shared/lib/utils";

import type { StaffMember, StaffStatus } from "../../types/staff.types";

type StaffListSectionProps = {
  members: StaffMember[];
  selectedMemberKey: string;
  onSelectMember: (memberKey: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  statusFilter: "All" | StaffStatus;
  onStatusFilterChange: (value: "All" | StaffStatus) => void;
};

const statusTone: Record<StaffStatus, string> = {
  "On Shift": "bg-[#EAF8F0] text-[#2E8B5D]",
  "Off Shift": "bg-[#F1F4F9] text-[#6F7B90]",
  Break: "bg-[#FFF3E8] text-[#B17035]",
};

const filters: Array<"All" | StaffStatus> = [
  "All",
  "On Shift",
  "Break",
  "Off Shift",
];

const StaffListSection = ({
  members,
  selectedMemberKey,
  onSelectMember,
  query,
  onQueryChange,
  statusFilter,
  onStatusFilterChange,
}: StaffListSectionProps) => {
  return (
    <section className="p-4 sm:p-5 xl:border-r xl:border-[#EEF1F5]">
      <h2 className="text-base font-semibold text-[#171A21]">Team Members</h2>

      <label className="mt-3 flex items-center rounded-md border border-[#E7EBF2] bg-[#F8FAFC] px-2 py-1.5 text-xs text-[#8D95A5]">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name, role, station..."
          className="w-full border-none bg-transparent text-xs text-[#374357] outline-none placeholder:text-[#A4ADBC]"
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-1">
        {filters.map((item) => {
          const active = item === statusFilter;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onStatusFilterChange(item)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                active
                  ? "border-[#D7DDED] bg-[#EEF2F8] text-[#4F5D75]"
                  : "border-[#E7EBF2] bg-white text-[#8D95A5] hover:bg-[#F8FAFC]",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 space-y-1.5">
        {members.map((member) => {
          const isActive = member.key === selectedMemberKey;

          return (
            <li key={member.key}>
              <button
                type="button"
                onClick={() => onSelectMember(member.key)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors",
                  isActive
                    ? "border-[#F7A9D5] bg-[#FFF5FB]"
                    : "border-transparent hover:bg-[#F9FAFB]",
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <InitialsAvatar
                    name={member.name}
                    className="h-9 w-9 border border-[#E8ECF3]"
                    online={member.status === "On Shift"}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#171A21]">
                      {member.name}
                    </p>
                    <p className="truncate text-[11px] text-[#7B869A]">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      statusTone[member.status],
                    )}
                  >
                    {member.status}
                  </span>
                  <ChevronRight className="h-4 w-4 text-[#C3C8D1]" />
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {members.length === 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-[#D6DFEB] p-4 text-center text-xs text-[#8D95A5]">
          No staff matched your search/filter.
        </div>
      )}
    </section>
  );
};

export default StaffListSection;
