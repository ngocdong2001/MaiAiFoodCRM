import type { ReactNode } from "react";

import AuthGuard from "@/features/dashboard/overview/components/layouts/AuthGuard";
import DashboardContainer from "@/features/dashboard/overview/components/layouts/DashboardContainer";
import DashboardFooter from "@/features/dashboard/overview/components/layouts/DashboardFooter";
import DashboardHeader from "@/features/dashboard/overview/components/layouts/DashboardHeader";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AuthGuard>
      <div className="flex min-h-screen flex-col bg-[#F9FAFB] text-[#171A21]">
        <DashboardHeader />
        <main className="flex-1 py-8">
          <DashboardContainer>{children}</DashboardContainer>
        </main>
        <DashboardFooter />
      </div>
    </AuthGuard>
  );
};

export default DashboardLayout;
