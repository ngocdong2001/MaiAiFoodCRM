import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ScrollArea } from "@/shared/components/ui/scroll-area";

import type { CalendarAppointment } from "../../types/calendar.types";

// Matches the palette used across the calendar's booking status controls.
const STATUS_CARD_STYLE: Record<
  string,
  { border: string; bg: string; accent: string; divider: string }
> = {
  pending: {
    border: "border-[#FBD9A3]",
    bg: "bg-[#FFF7EC]",
    accent: "text-[#B45309]",
    divider: "border-[#F5E2C2]",
  },
  confirmed: {
    border: "border-[#F7C6E4]",
    bg: "bg-[#FFF3FA]",
    accent: "text-primary",
    divider: "border-[#F7D9EA]",
  },
  completed: {
    border: "border-[#A7E8CE]",
    bg: "bg-[#ECFDF5]",
    accent: "text-[#0F766E]",
    divider: "border-[#C7F0DE]",
  },
  cancelled: {
    border: "border-[#F5B5B5]",
    bg: "bg-[#FEF2F2]",
    accent: "text-[#B91C1C]",
    divider: "border-[#F6D0D0]",
  },
  no_show: {
    border: "border-[#F5B5B5]",
    bg: "bg-[#FEF2F2]",
    accent: "text-[#B91C1C]",
    divider: "border-[#F6D0D0]",
  },
  in_progress: {
    border: "border-[#D6C2F5]",
    bg: "bg-[#F5F0FE]",
    accent: "text-[#6D28D9]",
    divider: "border-[#E4D6FA]",
  },
};

type WeeklyAppointmentBoardProps = {
  rangeLabel: string;
  weekStart: Date;
  events: CalendarAppointment[];
  onPrevious: () => void;
  onNext: () => void;
  onDayView: () => void;
  onSelectAppointment?: (appointment: CalendarAppointment) => void;
};

const sameDay = (event: CalendarAppointment, date: Date) =>
  event.year === date.getFullYear() &&
  event.month === date.getMonth() &&
  event.day === date.getDate();

const WeeklyAppointmentBoard = ({
  rangeLabel,
  weekStart,
  events,
  onPrevious,
  onNext,
  onDayView,
  onSelectAppointment,
}: WeeklyAppointmentBoardProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
  const today = new Date();

  return (
    <section className="overflow-hidden rounded-xl border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
      <header className="flex flex-col gap-3 border-b border-[#DEE1E7] p-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-xl font-semibold text-[#171A21]">
          <CalendarDays className="h-5 w-5 text-primary" />
          {t("dashboard.calendar.weeklyTitle")}
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center rounded-xl bg-[#EEF1F5] p-1">
            <button
              type="button"
              onClick={onDayView}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[#8D95A5] hover:text-[#171A21]"
            >
              {t("dashboard.calendar.day")}
            </button>
            <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-[#171A21] shadow-[0px_1px_2px_0px_#0000000f]">
              {t("dashboard.calendar.week")}
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-[#DEE1E7] bg-[#F9FAFB] px-1.5 py-1 shadow-[0px_2px_4px_0px_#00000012]">
            <button
              type="button"
              aria-label={t("dashboard.calendar.previousWeek")}
              onClick={onPrevious}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-32 px-2 text-center text-sm font-medium text-[#171A21]">
              {rangeLabel}
            </span>
            <button
              type="button"
              aria-label={t("dashboard.calendar.nextWeek")}
              onClick={onNext}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <ScrollArea horizontal className="h-[min(68vh,46rem)]">
        <div className="grid min-w-245 grid-cols-7 divide-x divide-[#E7EAF0]">
          {days.map((date) => {
            const dayEvents = events
              .filter((event) => sameDay(event, date))
              .sort((left, right) => left.startHour - right.startHour);
            const isToday = sameDay(
              {
                year: today.getFullYear(),
                month: today.getMonth(),
                day: today.getDate(),
              } as CalendarAppointment,
              date,
            );

            return (
              <div key={date.toISOString()} className="min-w-0 bg-[#FCFDFE]">
                <div className="border-b border-[#E7EAF0] px-3 py-3 text-center">
                  <p className="text-xs font-semibold uppercase text-[#8D95A5]">
                    {date.toLocaleDateString(locale, { weekday: "short" })}
                  </p>
                  <p
                    className={
                      isToday
                        ? "mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white"
                        : "mx-auto mt-1 flex h-8 w-8 items-center justify-center text-lg font-semibold text-[#171A21]"
                    }
                  >
                    {date.getDate()}
                  </p>
                </div>

                <div className="flex min-h-90 flex-col gap-2 p-2.5">
                  {dayEvents.map((event) => {
                    const style =
                      STATUS_CARD_STYLE[event.detail.status] ??
                      STATUS_CARD_STYLE.confirmed;
                    return (
                      <article
                        key={event.key}
                        className={`rounded-lg border ${style.border} ${style.bg} p-2.5 shadow-[0px_1px_2px_0px_#0000000d]`}
                      >
                        <div
                          className={`flex items-center gap-1.5 text-[11px] font-semibold ${style.accent}`}
                        >
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{event.detail.timeRange}</span>
                        </div>
                        <p className="mt-1.5 wrap-break-word text-sm font-semibold text-[#171A21]">
                          {event.title}
                        </p>
                        <p className="mt-0.5 wrap-break-word text-xs leading-4 text-[#6B7280]">
                          {event.subtitle}
                        </p>
                        <div className={`mt-2 border-t ${style.divider} pt-2`}>
                          <p className="wrap-break-word text-[11px] font-medium text-[#4B5563]">
                            {event.detail.stylist}
                          </p>
                          <p className="wrap-break-word text-[10px] text-[#8D95A5]">
                            {event.detail.stationArea}
                          </p>
                        </div>
                        {onSelectAppointment && event.appointment && (
                          <button
                            type="button"
                            onClick={() => onSelectAppointment(event)}
                            className="mt-2 w-full rounded-md border border-[#F7C6E4] bg-white px-2 py-1 text-xs font-medium text-primary hover:bg-[#FFF8FC]"
                          >
                            {t("dashboard.calendar.booking.reschedule")}
                          </button>
                        )}
                      </article>
                    );
                  })}

                  {dayEvents.length === 0 && (
                    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-[#E2E6EC] text-xs font-medium text-[#A2A9B5]">
                      {t("dashboard.calendar.noAppointments")}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </section>
  );
};

export default WeeklyAppointmentBoard;
