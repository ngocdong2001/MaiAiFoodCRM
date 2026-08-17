import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type EmptyStateProps = {
  message: ReactNode;
  icon?: ReactNode;
  variant?: "plain" | "dashed";
  className?: string;
};

const EmptyState = ({
  message,
  icon,
  variant = "plain",
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-8 text-center text-sm text-[#8D95A5]",
        variant === "dashed" &&
          "rounded-lg border border-dashed border-[#D6DFEB] p-4 text-xs",
        className,
      )}
    >
      {icon}
      <span>{message}</span>
    </div>
  );
};

export default EmptyState;
