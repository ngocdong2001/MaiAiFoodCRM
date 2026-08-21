import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  /** `stacked` puts the icon top-right above the value, `inline` puts it left of the text. */
  layout?: "stacked" | "inline";
  iconWrapperClassName?: string;
  hint?: ReactNode;
  hintClassName?: string;
  action?: ReactNode;
  className?: string;
};

const StatCard = ({
  label,
  value,
  icon,
  layout = "stacked",
  iconWrapperClassName,
  hint,
  hintClassName,
  action,
  className,
}: StatCardProps) => {
  if (layout === "inline") {
    return (
      <div
        className={cn(
          "flex flex-1 items-center gap-3 rounded-xl border border-[#DEE1E7] bg-white px-4 py-4",
          className,
        )}
      >
        {icon ? (
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              iconWrapperClassName,
            )}
          >
            {icon}
          </span>
        ) : null}
        <div className="flex-1">
          <p className="text-xs text-[#8D95A5]">{label}</p>
          <p className="text-lg font-semibold text-[#171A21]">{value}</p>
          {hint ? (
            <p className={cn("text-xs text-[#8D95A5]", hintClassName)}>
              {hint}
            </p>
          ) : null}
        </div>
        {action}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[#8D95A5]">{label}</p>
        {icon ? (
          <span
            className={cn(
              "flex items-center justify-center",
              iconWrapperClassName,
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-[#171A21]">
        {value}
      </p>
      {hint ? (
        <div className={cn("mt-1 text-xs font-medium", hintClassName)}>
          {hint}
        </div>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
};

export default StatCard;
