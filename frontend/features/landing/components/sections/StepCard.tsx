import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type StepCardProps = {
  stepNumber: number;
  title: string;
  description: string;
  badgeColor: "blue" | "pink" | "green";
  className?: string;
};

const badgeColorMap = {
  blue: "bg-[#0055FF] shadow-[0_0_24px_rgba(0,85,255,0.3)]",
  pink: "bg-[#FF00A9] shadow-[0_0_24px_rgba(255,0,169,0.3)]",
  green: "bg-[#4CE68C] shadow-[0_0_24px_rgba(76,230,140,0.3)]",
};

const cardGlowMap = {
  blue: "before:bg-[#0055FF]/10",
  pink: "before:bg-[#FF00A9]/10",
  green: "before:bg-[#4CE68C]/10",
};

const StepCard = ({
  stepNumber,
  title,
  description,
  badgeColor,
  className,
}: StepCardProps) => {
  return (
    <div className={cn("group relative h-full", className)}>
      {/* Number Badge - Overlay on top left */}
      <div
        className={cn(
          "absolute -top-6 left-8 z-10 flex h-14 w-14 items-center justify-center rounded-full ring-4 ring-background transition-transform duration-300 group-hover:scale-110",
          badgeColorMap[badgeColor],
        )}
      >
        <span className="text-2xl font-bold text-white">{stepNumber}</span>
      </div>

      {/* Card Content */}
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-xl border border-border/60 bg-linear-to-br from-background via-background to-muted/30 p-5 pt-12 shadow-sm transition-all duration-300 hover:shadow-xl sm:p-6 sm:pt-14 before:absolute before:inset-0 before:-z-10 before:opacity-0 before:blur-2xl before:transition-opacity before:duration-300 hover:before:opacity-100",
          cardGlowMap[badgeColor],
        )}
      >
        <h3 className="text-xl font-bold leading-tight tracking-tight text-foreground transition-colors sm:text-2xl">
          {title}
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
};

export default StepCard;
