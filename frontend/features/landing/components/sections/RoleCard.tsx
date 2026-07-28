import { CircleCheck } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type RoleCardProps = {
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  checkColor?: "blue" | "pink" | "purple" | "default";
  className?: string;
};

const checkColorMap = {
  blue: "text-[#0055FF]",
  pink: "text-[#FF00A9]",
  purple: "text-[#7A4CE6]",
  default: "text-foreground",
};

const subtitleColorMap = {
  blue: "text-[#0055FF]",
  pink: "text-[#FF00A9]",
  purple: "text-[#7A4CE6]",
  default: "text-primary",
};

const RoleCard = ({
  title,
  subtitle,
  description,
  benefits,
  checkColor = "default",
  className,
}: RoleCardProps) => {
  return (
    <div
      className={cn(
        "flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6",
        className,
      )}
    >
      <h3 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </h3>
      <p
        className={cn(
          "mt-1 text-sm font-medium sm:text-base",
          subtitleColorMap[checkColor],
        )}
      >
        {subtitle}
      </p>

      <p className="mt-4 text-sm leading-6 text-muted-foreground sm:mt-6 sm:text-base">
        {description}
      </p>

      <ul className="mt-6 space-y-3 sm:mt-8">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-center gap-3">
            <CircleCheck
              className={cn("h-4 w-4 shrink-0", checkColorMap[checkColor])}
            />
            <span className="text-xs text-foreground sm:text-sm">
              {benefit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoleCard;
