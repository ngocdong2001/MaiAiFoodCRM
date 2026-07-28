import { Check } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { staffMembers } from "@/features/dashboard/calendar/data/data";

const StaffFilters = () => {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-[#8D95A5]">
        Filters &amp; Staff
      </h2>

      <ul className="mt-3 space-y-3">
        {staffMembers.map((member) => (
          <li key={member.key} className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                member.active
                  ? "border-[#F04CAC] bg-[#F04CAC] text-white"
                  : "border-[#C3C8D1] bg-white",
              )}
            >
              {member.active && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <InitialsAvatar name={member.name} className="h-8 w-8" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[#171A21]">
                {member.name}
              </p>
              <p className="truncate text-xs text-[#8D95A5]">{member.role}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StaffFilters;
