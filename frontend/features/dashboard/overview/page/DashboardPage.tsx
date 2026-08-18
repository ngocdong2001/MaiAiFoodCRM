import LiveQueueSection from "../components/sections/LiveQueueSection";
import RecentGuestsSection from "../components/sections/RecentGuestsSection";
import StaffOnDutySection from "../components/sections/StaffOnDutySection";
import StatsSection from "../components/sections/StatsSection";
import TodaysSnapshotSection from "../components/sections/TodaysSnapshotSection";
import WelcomeSection from "../components/sections/WelcomeSection";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Greeting + quick actions */}
      <WelcomeSection />

      {/* Row 2: 6 KPI cards */}
      <StatsSection />

      {/* Row 3: 3-column main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <TodaysSnapshotSection />
        <LiveQueueSection />
        <StaffOnDutySection />
      </div>

      {/* Row 4: Recent guests full-width */}
      <RecentGuestsSection />
    </div>
  );
};

export default DashboardPage;

