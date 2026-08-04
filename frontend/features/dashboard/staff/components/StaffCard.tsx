import { Clock3, EllipsisVertical, MapPin } from "lucide-react";

import { cn } from "@/shared/lib/utils";

import type { StaffMember, StaffStatus } from "../types/staff.types";

type StaffCardProps = {
  member: StaffMember;
};

const statusDotClass: Record<StaffStatus, string> = {
  Active: "bg-[#37D278]",
  Busy: "bg-[#F8C83A]",
  "On Leave": "bg-[#DEE1E6]",
};

const statusTextClass: Record<StaffStatus, string> = {
  Active: "text-[#171A21]",
  Busy: "text-[#171A21]",
  "On Leave": "text-[#1E222A]",
};

const StaffCard = ({ member }: StaffCardProps) => {
  return (
    <div className="rounded-xl border border-[#DEE1E7] bg-white p-6 shadow-[0px_2px_4px_0px_#00000012]">
      <div className="flex items-start justify-between">
        <div className="relative">
          <img
            src={member.avatarUrl}
            alt={member.name}
            className="h-14 w-14 rounded-full object-cover"
          />
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white",
              statusDotClass[member.status],
            )}
          />
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8D95A5] hover:bg-[#F3F4F7]"
          aria-label={`More actions for ${member.name}`}
        >
          <EllipsisVertical className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 text-lg font-semibold text-[#171A21]">{member.name}</p>
      <p className="text-sm text-[#8D95A5]">{member.role}</p>

      {member.status === "On Leave" ? (
        <span className="mt-3 inline-flex items-center rounded-full bg-[#F3F4F7] px-2.5 py-1 text-xs font-semibold text-[#1E222A]">
          On Leave
        </span>
      ) : (
        <p
          className={cn(
            "mt-3 text-xs font-semibold",
            statusTextClass[member.status],
          )}
        >
          {member.status}
        </p>
      )}

      <div className="mt-4 space-y-2 border-t border-[#DEE1E7]/50 pt-4 text-sm text-[#8D95A5]">
        {member.shift && member.station ? (
          <>
            <p className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary/70" />
              {member.shift}
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary/70" />
              {member.station}
            </p>
          </>
        ) : (
          <p className="text-[#8D95A5]">Not scheduled today</p>
        )}
      </div>
    </div>
  );
};

export default StaffCard;
