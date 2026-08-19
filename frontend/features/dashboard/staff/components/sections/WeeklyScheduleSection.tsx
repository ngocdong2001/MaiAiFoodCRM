import WeeklySchedule from "@/shared/components/molecules/WeeklySchedule";

import type { ApiAppointment } from "@/features/dashboard/calendar/types/calendar.types";
import type { StaffMember } from "../../types/staff.types";

const scheduleHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const timeToHour = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours + minutes / 60;
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  confirmed: { bg: "#F04CAC", text: "#C91D8F" },
  in_progress: { bg: "#8B5CF6", text: "#6D28D9" },
  completed: { bg: "#10B981", text: "#059669" },
  cancelled: { bg: "#EF4444", text: "#DC2626" },
  no_show: { bg: "#6B7280", text: "#4B5563" },
  pending: { bg: "#F59E0B", text: "#B45309" },
};
const statusColor = (status: string) =>
  STATUS_COLORS[status] ?? STATUS_COLORS.pending;

type WeeklyScheduleSectionProps = {
  members: StaffMember[];
  selectedDate: string;
  onSelectedDateChange: (value: string) => void;
  onPrevDate: () => void;
  onNextDate: () => void;
  appointments: ApiAppointment[];
  isLoading: boolean;
};

const WeeklyScheduleSection = ({
  members,
  selectedDate,
  onSelectedDateChange,
  onPrevDate,
  onNextDate,
  appointments,
  isLoading,
}: WeeklyScheduleSectionProps) => {
  const toHourFromIso = (value: string) => {
    const date = new Date(value);
    return date.getHours() + date.getMinutes() / 60;
  };

  const toTimeRange = (startIso: string, endIso: string) => {
    const fmt = (iso: string) =>
      new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    return `${fmt(startIso)} - ${fmt(endIso)}`;
  };

  const rangeLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
    [],
    { year: "numeric", month: "short", day: "numeric" },
  );

  return (
    <WeeklySchedule
      rangeLabel={rangeLabel}
      onPrevRange={onPrevDate}
      onNextRange={onNextDate}
      dateValue={selectedDate}
      onDateChange={onSelectedDateChange}
      isLoading={isLoading}
      hours={scheduleHours}
      resources={members.map((member) => ({
        key: member.key,
        name: member.name,
        subtitle: member.role,
        avatarUrl: member.avatarUrl ?? undefined,
      }))}
      slots={members.flatMap((member) => {
        const schedule = member.schedules[0];

        // Individual appointment blocks for this staff member
        const apptSlots = appointments
          .filter((a) => a.staffId === member.id)
          .map((a) => {
            const { bg, text } = statusColor(a.status);
            return {
              resourceKey: member.key,
              startHour: toHourFromIso(a.startTime),
              endHour: toHourFromIso(a.endTime),
              label: a.guest?.name ?? "Walk-in",
              sublabel: a.services.map((s) => s.name).join(", "),
              color: bg,
              textColor: text,
              slotType: "work" as const,
              workItems: [
                {
                  id: String(a.id),
                  title: `${a.guest?.name ?? "Walk-in"} \u2013 ${a.services.map((s) => s.name).join(", ")}`,
                  timeRange: toTimeRange(a.startTime, a.endTime),
                  detail: a.status,
                },
              ],
            };
          });

        // Helper: collect workItems from apptSlots overlapping a time range
        const apptWorkItems = (rangeStart: number, rangeEnd: number) =>
          apptSlots
            .filter((a) => a.startHour < rangeEnd && a.endHour > rangeStart)
            .flatMap((a) => a.workItems);

        if (!schedule || schedule.isDayOff) return apptSlots;

        const shiftStart = timeToHour(schedule.startTime);
        const shiftEnd = timeToHour(schedule.endTime);
        const breakStart = schedule.breakStart;
        const breakEnd = schedule.breakEnd;
        const hasValidBreak =
          typeof breakStart === "string" &&
          typeof breakEnd === "string" &&
          timeToHour(breakStart) > shiftStart &&
          timeToHour(breakEnd) < shiftEnd &&
          timeToHour(breakStart) < timeToHour(breakEnd);

        // Shift background blocks (clickable — show appointments in popover)
        const shiftSlots = hasValidBreak
          ? [
              {
                resourceKey: member.key,
                startHour: shiftStart,
                endHour: timeToHour(breakStart!),
                label: `${schedule.startTime} – ${breakStart}`,
                sublabel: schedule.note ?? undefined,
                slotType: "work" as const,
                note: schedule.note ?? undefined,
                workItems: apptWorkItems(shiftStart, timeToHour(breakStart!)),
              },
              {
                resourceKey: member.key,
                startHour: timeToHour(breakStart!),
                endHour: timeToHour(breakEnd!),
                label: `Break ${breakStart} – ${breakEnd}`,
                color: "#F59E0B",
                textColor: "#B45309",
                slotType: "break" as const,
                workItems: [] as (typeof apptSlots)[0]["workItems"],
              },
              {
                resourceKey: member.key,
                startHour: timeToHour(breakEnd!),
                endHour: shiftEnd,
                label: `${breakEnd} – ${schedule.endTime}`,
                slotType: "work" as const,
                workItems: apptWorkItems(timeToHour(breakEnd!), shiftEnd),
              },
            ]
          : [
              {
                resourceKey: member.key,
                startHour: shiftStart,
                endHour: shiftEnd,
                label: `${schedule.startTime} – ${schedule.endTime}`,
                sublabel: schedule.note ?? undefined,
                slotType: "work" as const,
                note: schedule.note ?? undefined,
                workItems: apptWorkItems(shiftStart, shiftEnd),
              },
            ];

        return [...shiftSlots, ...apptSlots];
      })}
    />
  );
};

export default WeeklyScheduleSection;
