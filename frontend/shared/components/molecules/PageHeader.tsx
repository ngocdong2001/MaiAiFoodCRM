import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type PageHeaderSize = "sm" | "md" | "lg";

type PageHeaderProps = {
  title: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  size?: PageHeaderSize;
  className?: string;
};

const titleSize: Record<PageHeaderSize, string> = {
  sm: "text-2xl",
  md: "text-[26px]",
  lg: "text-[30px]",
};

const PageHeader = ({
  title,
  subtitle,
  icon,
  actions,
  size = "md",
  className,
}: PageHeaderProps) => {
  return (
    <div
      className={cn(
        "flex flex-col justify-between gap-4 sm:flex-row sm:items-start",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <h1
            className={cn(
              "font-bold tracking-tight text-[#171A21]",
              titleSize[size],
            )}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm text-[#8D95A5]">{subtitle}</p>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
};

export default PageHeader;
