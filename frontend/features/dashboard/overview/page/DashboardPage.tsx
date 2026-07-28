import AIRecommendationsSection from "../components/sections/AIRecommendationsSection";
import AlertsBanner from "../components/sections/AlertsBanner";
import LiveQueueSection from "../components/sections/LiveQueueSection";
import RecentGuestsSection from "../components/sections/RecentGuestsSection";
import StatsSection from "../components/sections/StatsSection";
import TodaysSnapshotSection from "../components/sections/TodaysSnapshotSection";
import WelcomeSection from "../components/sections/WelcomeSection";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <WelcomeSection />
      <StatsSection />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <AlertsBanner />
          <TodaysSnapshotSection />
        </div>
        <LiveQueueSection />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentGuestsSection />
        <AIRecommendationsSection />
      </div>
    </div>
  );
};

export default DashboardPage;
