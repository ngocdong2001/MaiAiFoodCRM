import WeeklySchedule from "@/shared/components/molecules/WeeklySchedule";

import { scheduleHours, scheduleSlots } from "../../data/data";
import type { StaffMember } from "../../types/staff.types";

type WeeklyScheduleSectionProps = {
  members: StaffMember[];
  weekLabel: string;
};

const WeeklyScheduleSection = ({
  members,
  weekLabel,
}: WeeklyScheduleSectionProps) => {
  return (
    <WeeklySchedule
      rangeLabel={weekLabel}
      hours={scheduleHours}
      resources={members.map((member) => ({
        key: member.key,
        name: member.name,
        subtitle: member.role,
        avatarUrl: member.avatarUrl,
      }))}
      slots={scheduleSlots.map((slot) => ({
        resourceKey: slot.staffKey,
        startHour: slot.startHour,
        endHour: slot.endHour,
        sublabel: slot.station,
      }))}
      onAction={() => {}}
    />
  );
};

export default WeeklyScheduleSection;
