import WeeklySchedule from "@/shared/components/molecules/WeeklySchedule";

import type { ApiAppointment } from "@/features/dashboard/calendar/types/calendar.types";
import type { StaffMember } from "../../types/staff.types";

const scheduleHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const timeToHour = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours + minutes / 60;
};

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
    const start = new Date(startIso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const end = new Date(endIso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${start} - ${end}`;
  };

  const getSlotWorkItems = (
    staffId: number,
    startHour: number,
    endHour: number,
  ) => {
    return appointments
      .filter((appointment) => {
        if (appointment.staffId !== staffId) {
          return false;
        }
        const appointmentStartHour = toHourFromIso(appointment.startTime);
        const appointmentEndHour = toHourFromIso(appointment.endTime);
        return appointmentStartHour < endHour && appointmentEndHour > startHour;
      })
      .map((appointment) => ({
        id: String(appointment.id),
        title: `${appointment.guest.name} - ${appointment.services.map((service) => service.name).join(", ")}`,
        timeRange: toTimeRange(appointment.startTime, appointment.endTime),
        detail: appointment.status,
      }));
  };

  const rangeLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
    [],
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
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

        if (!schedule || schedule.isDayOff) {
          return [];
        }

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

        if (!hasValidBreak) {
          const workItems = getSlotWorkItems(member.id, shiftStart, shiftEnd);
          return [
            {
              resourceKey: member.key,
              startHour: shiftStart,
              endHour: shiftEnd,
              label: `${schedule.startTime} - ${schedule.endTime}`,
              sublabel: schedule.note ?? undefined,
              slotType: "work" as const,
              note: schedule.note ?? undefined,
              workItems,
            },
          ];
        }

        const breakStartHour = timeToHour(breakStart);
        const breakEndHour = timeToHour(breakEnd);

        const workBeforeBreak = {
          resourceKey: member.key,
          startHour: shiftStart,
          endHour: breakStartHour,
          label: `${schedule.startTime} - ${breakStart}`,
          sublabel: schedule.note ?? undefined,
          slotType: "work" as const,
          note: schedule.note ?? undefined,
          workItems: getSlotWorkItems(member.id, shiftStart, breakStartHour),
        };

        const lunchBreak = {
          resourceKey: member.key,
          startHour: breakStartHour,
          endHour: breakEndHour,
          label: `Lunch ${breakStart} - ${breakEnd}`,
          color: "#F59E0B",
          textColor: "#B45309",
          slotType: "break" as const,
          workItems: getSlotWorkItems(member.id, breakStartHour, breakEndHour),
        };

        const workAfterBreak = {
          resourceKey: member.key,
          startHour: breakEndHour,
          endHour: shiftEnd,
          label: `${breakEnd} - ${schedule.endTime}`,
          slotType: "work" as const,
          workItems: getSlotWorkItems(member.id, breakEndHour, shiftEnd),
        };

        return [workBeforeBreak, lunchBreak, workAfterBreak];
      })}
    />
  );
};

export default WeeklyScheduleSection;
