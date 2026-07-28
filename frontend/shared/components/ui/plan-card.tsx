import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type PlanCardProps = {
  children: ReactNode;
  className?: string;
};

const PlanCard = ({ children, className }: PlanCardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card/95 p-5 shadow-xl shadow-black/5 backdrop-blur-sm dark:bg-card/90 dark:shadow-black/20",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default PlanCard;
