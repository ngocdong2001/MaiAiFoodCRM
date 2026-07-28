import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type FeatureCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
};

const FeatureCard = ({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        "h-full flex flex-col rounded-2xl border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 lg:p-8",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-surface sm:h-12 sm:w-12">
        {icon}
      </div>
      <h3 className="mt-3 text-base font-semibold tracking-tight text-foreground sm:mt-4 sm:text-lg lg:mt-5 lg:text-xl">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;
