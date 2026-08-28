"use client";

import { Sparkles } from "lucide-react";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useAppointments, useCalendarOptions } from "../hooks/useCalendar";
import type { CalendarAppointment, StaffMember } from "../types/calendar.types";

type ContextValue = {
  cursorDate: Date;
  setCursorDate: React.Dispatch<React.SetStateAction<Date>>;
  staffMembers: StaffMember[];
  appointments: CalendarAppointment[];
  selectedStaffIds: number[];
  toggleStaff: (id: number) => void;
  queueRequests: Array<{
    key: string;
    name: string;
    service: string;
    wait: string;
  }>;
  isLoading: boolean;
};

const Context = createContext<ContextValue | null>(null);
const tone = (status: string): CalendarAppointment["tone"] =>
  status === "confirmed"
    ? "primary"
    : status === "cancelled" || status === "no_show"
      ? "danger"
      : status === "completed"
        ? "success"
        : "muted";
const decimalHour = (date: Date) => date.getHours() + date.getMinutes() / 60;

export const CalendarDataProvider = ({ children }: { children: ReactNode }) => {
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const start = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1);
  const end = new Date(
    cursorDate.getFullYear(),
    cursorDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );
  const options = useCalendarOptions();
  const appointments = useAppointments({
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    staffIds: selectedStaffIds.length ? selectedStaffIds.join(",") : undefined,
  });

  const staffMembers = useMemo(
    () =>
      (options.data?.staff ?? []).map((staff) => ({
        key: String(staff.id),
        name: staff.name,
        role: staff.role,
        active:
          selectedStaffIds.length === 0 || selectedStaffIds.includes(staff.id),
      })),
    [options.data?.staff, selectedStaffIds],
  );
  const events = useMemo(
    () =>
      (appointments.data ?? [])
        .filter((appointment) => appointment.status !== "cancelled")
        .map((appointment) => {
          const startTime = new Date(appointment.startTime);
          const endTime = new Date(appointment.endTime);
          return {
            key: String(appointment.id),
            title: appointment.guest.name,
            subtitle: appointment.services
              .map((service) => service.name)
              .join(", "),
            resourceKey: String(appointment.staffId),
            year: startTime.getFullYear(),
            month: startTime.getMonth(),
            day: startTime.getDate(),
            startHour: decimalHour(startTime),
            endHour: decimalHour(endTime),
            tone: tone(appointment.status),
            detail: {
              status: appointment.status,
              guest: appointment.guest.name,
              membership:
                appointment.guest.loyaltyPoints >= 1000
                  ? "VIP Member"
                  : "Guest",
              visit: `${appointment.guest.totalVisits + 1}th Visit`,
              service: appointment.services
                .map((service) => service.name)
                .join(", "),
              stylist: appointment.staff.name,
              duration: `${Math.round(((endTime.getTime() - startTime.getTime()) / 3_600_000) * 10) / 10} hrs`,
              timeRange: `${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
              station: appointment.station ?? "Unassigned",
              stationArea: appointment.staff.role,
              clientNotes:
                appointment.notes ?? appointment.guest.notes ?? "No notes",
              aiSuggestion: {
                icon: Sparkles,
                title: "Service recommendation",
                description:
                  "Recommendations are generated from the guest service history.",
              },
            },
            appointment,
          } satisfies CalendarAppointment;
        }),
    [appointments.data],
  );

  const value = useMemo<ContextValue>(
    () => ({
      cursorDate,
      setCursorDate,
      staffMembers,
      appointments: events,
      selectedStaffIds,
      toggleStaff: (id) =>
        setSelectedStaffIds((current) =>
          current.includes(id)
            ? current.filter((item) => item !== id)
            : [...current, id],
        ),
      queueRequests: [],
      isLoading: options.isPending || appointments.isPending,
    }),
    [
      cursorDate,
      staffMembers,
      events,
      selectedStaffIds,
      options.isPending,
      appointments.isPending,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export const useCalendarData = () => {
  const value = useContext(Context);
  if (!value)
    throw new Error("useCalendarData must be used within CalendarDataProvider");
  return value;
};
