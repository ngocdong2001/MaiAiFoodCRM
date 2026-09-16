import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  /** `stacked` puts the icon top-right above the value, `inline` puts it left of the text. */
  layout?: "stacked" | "inline";
  /** Visual variant: "default" = white bg, "pink" = pink bg with white text. */
  variant?: "default" | "pink";
  iconWrapperClassName?: string;
  iconBgColor?: string;
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
  variant = "default",
  iconWrapperClassName,
  iconBgColor,
  hint,
  hintClassName,
  action,
  className,
}: StatCardProps) => {
  const isPink = variant === "pink";

  if (layout === "inline") {
    return (
      <div
        className={cn(
          "flex flex-1 items-center gap-3 rounded-xl border border-[#DEE1E7] bg-white px-4 py-4",
          isPink && "border-transparent bg-[#f04cac] text-white",
          className,
        )}
      >
        {icon ? (
          <span
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isPink ? "bg-white/20" : iconBgColor,
              iconWrapperClassName,
            )}
          >
            {icon}
          </span>
        ) : null}
        <div className="flex-1">
          <p className={cn("text-xs", isPink ? "text-white/80" : "text-[#8D95A7]")}>{label}</p>
          <p className={cn("text-lg font-semibold", isPink ? "text-[#f6f7f9]" : "text-[#171A21]")}>{value}</p>
          {hint ? (
            <p className={cn("text-xs", isPink ? "text-white/70" : "text-[#8D95A5]", hintClassName)}>
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
        "flex flex-col rounded-[12px] p-5 shadow-[0px_2px_4px_0px_#00000012]",
        isPink ? "bg-[#f04cac]" : "bg-white",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        {icon ? (
          <span
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px]",
              isPink ? "bg-white/20" : "bg-transparent",
              iconWrapperClassName,
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>
      <p className={cn("text-xs", isPink ? "text-white/80" : "text-[#9DA1A7]")}>{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tracking-tight", isPink ? "text-[#f6f7f9]" : "text-[#1D1F23]")}>
        {value}
      </p>
      {hint ? (
        <div className={cn("mt-2 text-xs", isPink ? "text-white/70" : "text-[#9DA1A7]", hintClassName)}>
          {hint}
        </div>
      ) : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
};

export default StatCard;
