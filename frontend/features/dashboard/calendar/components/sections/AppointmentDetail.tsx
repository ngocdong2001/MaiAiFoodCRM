"use client";

import { Clock, MapPin, Scissors, Star, X } from "lucide-react";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import type { CalendarAppointment } from "@/features/dashboard/calendar/types/calendar.types";

type AppointmentDetailProps = {
  appointment: CalendarAppointment;
  onClose: () => void;
  onReschedule: (appointment: CalendarAppointment) => void;
};

const AppointmentDetail = ({
  appointment,
  onClose,
  onReschedule,
}: AppointmentDetailProps) => {
  const { detail } = appointment;
  const AiIcon = detail.aiSuggestion.icon;

  return (
    <div className="h-full overflow-hidden rounded-xl border border-[#DEE1E7] bg-white shadow-[0px_12px_32px_0px_#00000014]">
      <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
        <div className="flex items-center justify-between px-5 pt-5">
          <span className="rounded-full bg-[#E8FBE7] px-3 py-1 text-xs font-semibold text-[#2FA35C]">
            {detail.status}
          </span>
          <button
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#8D95A5] transition-colors hover:bg-[#F1F3F5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pb-5">
          <div className="flex flex-col items-center px-5 pt-2">
            <InitialsAvatar name={detail.guest} className="h-16 w-16 text-lg" />
            <h2 className="mt-3 text-lg font-bold text-[#171A21]">
              {detail.guest}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-xs text-[#8D95A5]">
              <Star className="h-3.5 w-3.5 fill-[#F5B301] text-[#F5B301]" />
              {detail.membership} · {detail.visit}
            </p>
          </div>

          <div className="mt-4 space-y-3 px-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Scissors className="h-4 w-4 text-primary" />
              </span>
              <div>
                <p className="text-sm font-medium text-[#171A21]">
                  {detail.service}
                </p>
                <p className="text-xs text-[#8D95A5]">
                  with {detail.stylist} · {detail.duration}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F3F5]">
                <Clock className="h-4 w-4 text-[#8D95A5]" />
              </span>
              <p className="text-sm text-[#171A21]">{detail.timeRange}</p>
            </div>

            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F1F3F5]">
                <MapPin className="h-4 w-4 text-[#8D95A5]" />
              </span>
              <div>
                <p className="text-sm font-medium text-[#171A21]">
                  {detail.station}
                </p>
                <p className="text-xs text-[#8D95A5]">{detail.stationArea}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 px-5">
            <p className="text-sm font-medium text-[#171A21]">Client Notes</p>
            <p className="mt-2 rounded-lg border border-[#EEF0F3] bg-[#F9FAFB] p-3 text-xs leading-relaxed text-[#6B7280]">
              {detail.clientNotes}
            </p>
          </div>

          <div className="mx-5 mt-4 rounded-xl border border-[#E4DAF5] bg-[#FBFAFE] p-4">
            <div className="flex items-center gap-2">
              <AiIcon className="h-4 w-4 text-[#8A4CE0]" />
              <span className="text-sm font-semibold text-[#8A4CE0]">
                AI Suggestion
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-[#171A21]">
              {detail.aiSuggestion.title}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
              {detail.aiSuggestion.description}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg border border-[#DEE1E7] bg-white px-3 py-1.5 text-xs font-medium text-[#171A21] transition-colors hover:bg-[#F9FAFB]"
              >
                Dismiss
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-[#8A4CE0] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#7A3ED0]"
              >
                Add to Appt
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 border-t border-[#EEF0F3] p-5">
            <button
              type="button"
              onClick={() => onReschedule(appointment)}
              className="flex-1 rounded-[10px] border border-[#DEE1E7] bg-white px-4 py-2.5 text-sm font-medium text-[#171A21] transition-colors hover:bg-[#F9FAFB]"
            >
              Reschedule
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              <Scissors className="h-4 w-4" />
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetail;
