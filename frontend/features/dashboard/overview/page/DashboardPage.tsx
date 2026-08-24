import LiveQueueSection from "../components/sections/LiveQueueSection";
import RecentGuestsSection from "../components/sections/RecentGuestsSection";
import StatsSection from "../components/sections/StatsSection";
import TodaysSnapshotSection from "../components/sections/TodaysSnapshotSection";
import WelcomeSection from "../components/sections/WelcomeSection";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Row 1: Greeting + quick actions */}
      <WelcomeSection />

      {/* Row 2: 4 KPI cards */}
      <StatsSection />

      {/* Row 3: Live queue table */}
      <LiveQueueSection />

      {/* Row 4: Recent guests + schedule overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentGuestsSection />
        <TodaysSnapshotSection />
      </div>
    </div>
  );
};

export default DashboardPage;
