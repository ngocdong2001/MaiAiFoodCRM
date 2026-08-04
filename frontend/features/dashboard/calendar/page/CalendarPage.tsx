"use client";

import CalendarSidebar from "../components/sections/CalendarSidebar";
import LiveQueuePanel from "../components/sections/LiveQueuePanel";
import StaffDailyScheduleSection from "../components/sections/StaffDailyScheduleSection";

const CalendarPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="min-w-0">
        <StaffDailyScheduleSection />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="xl:self-start">
          <CalendarSidebar />
        </div>

        <div className="xl:self-start">
          <LiveQueuePanel />
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
