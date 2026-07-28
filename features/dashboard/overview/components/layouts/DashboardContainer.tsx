import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type DashboardContainerProps = {
  children: ReactNode;
  className?: string;
};

const DashboardContainer = ({
  children,
  className,
}: DashboardContainerProps) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-360 px-4 sm:px-6 lg:px-12",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default DashboardContainer;
