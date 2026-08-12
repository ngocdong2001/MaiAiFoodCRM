import { Clock3, Edit3, EllipsisVertical, MapPin, Trash2 } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import {
  staffStatusLabels,
  type StaffMember,
  type StaffStatus,
} from "../types/staff.types";

type StaffCardProps = {
  member: StaffMember;
  onEdit: (member: StaffMember) => void;
  onDelete: (member: StaffMember) => void;
};

const statusDotClass: Record<StaffStatus, string> = {
  active: "bg-[#37D278]",
  busy: "bg-[#F8C83A]",
  on_leave: "bg-[#DEE1E6]",
};

const statusTextClass: Record<StaffStatus, string> = {
  active: "text-[#171A21]",
  busy: "text-[#171A21]",
  on_leave: "text-[#1E222A]",
};

const formatShift = (startTime: string, endTime: string) =>
  `${startTime} - ${endTime}`;

const StaffCard = ({ member, onEdit, onDelete }: StaffCardProps) => {
  const schedule = member.schedules[0];
  return (
    <div className="rounded-xl border border-[#DEE1E7] bg-white p-6 shadow-[0px_2px_4px_0px_#00000012]">
      <div className="flex items-start justify-between">
        <div className="relative">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {member.name
                .split(" ")
                .slice(0, 2)
                .map((part) => part[0])
                .join("")}
            </span>
          )}
          <span
            className={cn(
              "absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white",
              statusDotClass[member.status],
            )}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8D95A5] hover:bg-[#F3F4F7]"
            aria-label={`More actions for ${member.name}`}
          >
            <EllipsisVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(member)}>
              <Edit3 /> Edit staff
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(member)}
              className="text-destructive"
            >
              <Trash2 /> Delete staff
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-4 text-lg font-semibold text-[#171A21]">{member.name}</p>
      <p className="text-sm text-[#8D95A5]">{member.role}</p>

      {member.status === "on_leave" ? (
        <span className="mt-3 inline-flex items-center rounded-full bg-[#F3F4F7] px-2.5 py-1 text-xs font-semibold text-[#1E222A]">
          {staffStatusLabels[member.status]}
        </span>
      ) : (
        <p
          className={cn(
            "mt-3 text-xs font-semibold",
            statusTextClass[member.status],
          )}
        >
          {staffStatusLabels[member.status]}
        </p>
      )}

      <div className="mt-4 space-y-2 border-t border-[#DEE1E7]/50 pt-4 text-sm text-[#8D95A5]">
        {schedule && !schedule.isDayOff ? (
          <>
            <p className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary/70" />
              {formatShift(schedule.startTime, schedule.endTime)}
            </p>
            {schedule.breakStart && schedule.breakEnd ? (
              <p className="flex items-center gap-2 rounded-md bg-[#FFF7ED] px-2 py-1 text-xs font-medium text-[#B45309]">
                <span className="inline-block h-2 w-2 rounded-full bg-[#F59E0B]" />
                Lunch break: {schedule.breakStart} - {schedule.breakEnd}
              </p>
            ) : null}
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary/70" />
              {schedule.note ?? "No station assigned"}
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
