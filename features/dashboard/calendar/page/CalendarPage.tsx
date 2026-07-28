"use client";

import { useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";

import CalendarScheduler from "@/shared/components/molecules/CalendarScheduler";
import {
  schedulerAnchorDate,
  schedulerDayRange,
  schedulerEvents,
  schedulerResources,
} from "@/features/dashboard/calendar/data/data";

import AppointmentDetail from "../components/sections/AppointmentDetail";
import CalendarSidebar from "../components/sections/CalendarSidebar";
import LiveQueuePanel from "../components/sections/LiveQueuePanel";

const CalendarPage = () => {
  const [selectedKey, setSelectedKey] = useState<string | undefined>(
    "olivia-pope",
  );
  const [popupPosition, setPopupPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const schedulerWrapRef = useRef<HTMLDivElement>(null);
  const showAppointmentDetail = Boolean(selectedKey);
  const selectedEvent = schedulerEvents.find(
    (event) => event.key === selectedKey,
  );

  return (
    <div className="rounded-xl border border-[#DEE1E7] bg-white shadow-[0px_1px_2px_0px_#0000000a]">
      <div className="flex flex-col lg:flex-row">
        <CalendarSidebar />

        <div ref={schedulerWrapRef} className="relative min-w-0 flex-1">
          <CalendarScheduler
            resources={schedulerResources}
            events={schedulerEvents}
            anchorDate={schedulerAnchorDate}
            defaultView="day"
            dayStartHour={schedulerDayRange.startHour}
            dayEndHour={schedulerDayRange.endHour}
            selectedEventKey={selectedKey}
            onEventSelect={(key, anchorRect) => {
              setSelectedKey(key);

              if (!anchorRect || !schedulerWrapRef.current) {
                return;
              }

              const hostRect = schedulerWrapRef.current.getBoundingClientRect();
              const panelWidth = 360;
              const panelHeight = 560;
              const gap = 12;
              const placeLeft =
                anchorRect.right + panelWidth + gap > hostRect.right;

              const rawLeft = placeLeft
                ? anchorRect.left - hostRect.left - panelWidth - gap
                : anchorRect.right - hostRect.left + gap;
              const rawTop =
                anchorRect.top -
                hostRect.top -
                (panelHeight - anchorRect.height) / 2;

              const clampedLeft = Math.max(
                12,
                Math.min(rawLeft, hostRect.width - panelWidth - 12),
              );
              const clampedTop = Math.max(
                12,
                Math.min(rawTop, hostRect.height - panelHeight - 12),
              );

              setPopupPosition({
                left: clampedLeft,
                top: clampedTop,
              });
            }}
          />

          {showAppointmentDetail && selectedEvent && (
            <div
              className={cn(
                "absolute z-50 hidden w-90 lg:block",
                !popupPosition && "right-4 top-4",
              )}
              style={
                popupPosition
                  ? {
                      left: `${popupPosition.left}px`,
                      top: `${popupPosition.top}px`,
                    }
                  : undefined
              }
            >
              <AppointmentDetail
                detail={selectedEvent.detail}
                onClose={() => {
                  setSelectedKey(undefined);
                  setPopupPosition(null);
                }}
              />
            </div>
          )}

          {showAppointmentDetail && selectedEvent && (
            <div className="border-t border-[#DEE1E7] bg-white p-4 lg:hidden">
              <AppointmentDetail
                detail={selectedEvent.detail}
                onClose={() => {
                  setSelectedKey(undefined);
                  setPopupPosition(null);
                }}
              />
            </div>
          )}
        </div>

        <LiveQueuePanel />
      </div>
    </div>
  );
};

export default CalendarPage;
