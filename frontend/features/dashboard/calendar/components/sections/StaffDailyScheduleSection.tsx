import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import WeeklySchedule, {
  type WeeklyScheduleViewMode,
} from "@/shared/components/molecules/WeeklySchedule";

import { useCalendarData } from "../../context/CalendarDataContext";
import type { CalendarAppointment } from "../../types/calendar.types";
import { BookingFormContent } from "../BookingFormDialog";
import BookingStatusControl from "./BookingStatusControl";
import WeeklyAppointmentBoard from "./WeeklyAppointmentBoard";

const DEFAULT_START_HOUR = 8;
const DEFAULT_END_HOUR = 18;

// Matches the palette used by BookingStatusControl/QueueStatusCell badges.
const STATUS_COLORS: Record<string, { color: string; textColor: string }> = {
  pending: { color: "#F59E0B", textColor: "#B45309" },
  confirmed: { color: "#F04CAC", textColor: "#C91D8F" },
  completed: { color: "#10B981", textColor: "#0F766E" },
  cancelled: { color: "#EF4444", textColor: "#B91C1C" },
  no_show: { color: "#EF4444", textColor: "#B91C1C" },
  in_progress: { color: "#8A4CE0", textColor: "#6D28D9" },
};

const getWeekStart = (date: Date) => {
  const copy = new Date(date);
  const day = copy.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + offset);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const StaffDailyScheduleSection = () => {
  const {
    appointments: schedulerEvents,
    staffMembers,
    cursorDate,
    setCursorDate,
  } = useCalendarData();
  const [viewMode, setViewMode] = useState<WeeklyScheduleViewMode>("week");
  const [editingAppointment, setEditingAppointment] =
    useState<CalendarAppointment | null>(null);
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";

  const rangeLabel = useMemo(() => {
    if (viewMode === "day") {
      return cursorDate.toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    const weekStart = getWeekStart(cursorDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    return `${weekStart.toLocaleDateString(locale, { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" })}`;
  }, [cursorDate, locale, viewMode]);

  const visibleEvents = useMemo(() => {
    const dayStart = new Date(cursorDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    return schedulerEvents.filter((event) => {
      const eventDate = new Date(event.year, event.month, event.day);
      return (
        Boolean(event.resourceKey) &&
        eventDate >= dayStart &&
        eventDate <= dayEnd
      );
    });
  }, [cursorDate, schedulerEvents]);

  const resources = useMemo(() => {
    return staffMembers.map((member) => ({
      key: member.key,
      name: member.name,
      subtitle: member.role,
    }));
  }, [staffMembers]);

  const slots = useMemo(
    () =>
      visibleEvents.map((event) => {
        const palette =
          STATUS_COLORS[event.detail.status] ?? STATUS_COLORS.pending;
        return {
          resourceKey: event.resourceKey!,
          startHour: event.startHour,
          endHour: event.endHour,
          label: event.title,
          sublabel: event.subtitle,
          color: palette.color,
          textColor: palette.textColor,
          workItems: [
            {
              id: event.key,
              title: `${event.title} – ${event.subtitle}`,
              timeRange: event.detail.timeRange,
              detail: event.detail.status,
            },
          ],
          extra: (
            <BookingStatusControl
              appointmentId={Number(event.key)}
              status={event.detail.status}
            />
          ),
        };
      }),
    [visibleEvents],
  );

  const hours = useMemo(() => {
    const firstHour = Math.min(
      DEFAULT_START_HOUR,
      ...slots.map((slot) => Math.floor(slot.startHour)),
    );
    const lastHour = Math.max(
      DEFAULT_END_HOUR,
      ...slots.map((slot) => Math.ceil(slot.endHour)),
    );

    return Array.from(
      { length: lastHour - firstHour + 1 },
      (_, index) => firstHour + index,
    );
  }, [slots]);

  const editDialog = editingAppointment ? (
    <BookingFormContent
      open={Boolean(editingAppointment)}
      onOpenChange={(open) => {
        if (!open) setEditingAppointment(null);
      }}
      initialDate={new Date(editingAppointment.appointment!.startTime)}
      onCreated={setCursorDate}
      appointment={editingAppointment.appointment!}
    />
  ) : null;

  if (viewMode === "week") {
    const weekStart = getWeekStart(cursorDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    const weekEvents = schedulerEvents.filter((event) => {
      const eventDate = new Date(event.year, event.month, event.day);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });

    return (
      <>
        <WeeklyAppointmentBoard
          rangeLabel={rangeLabel}
          weekStart={weekStart}
          events={weekEvents}
          onSelectAppointment={setEditingAppointment}
          onDayView={() => setViewMode("day")}
          onPrevious={() =>
            setCursorDate((current) => {
              const next = new Date(current);
              next.setDate(current.getDate() - 7);
              return next;
            })
          }
          onNext={() =>
            setCursorDate((current) => {
              const next = new Date(current);
              next.setDate(current.getDate() + 7);
              return next;
            })
          }
        />
        {editDialog}
      </>
    );
  }

  return (
    <>
      <WeeklySchedule
        title={t("dashboard.calendar.dailyTitle")}
        rangeLabel={rangeLabel}
        hours={hours}
        resources={resources}
        slots={slots}
        activeViewMode={viewMode}
        viewModes={["day", "week"]}
        onViewModeChange={setViewMode}
        onPrevRange={() => {
          setCursorDate((prev) => {
            const next = new Date(prev);
            next.setDate(prev.getDate() - (viewMode === "day" ? 1 : 7));
            return next;
          });
        }}
        onNextRange={() => {
          setCursorDate((prev) => {
            const next = new Date(prev);
            next.setDate(prev.getDate() + (viewMode === "day" ? 1 : 7));
            return next;
          });
        }}
      />
      {editDialog}
    </>
  );
};

export default StaffDailyScheduleSection;
