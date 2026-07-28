import type { ReactNode } from "react";

import { CircleCheck } from "lucide-react";

import { cn } from "@/shared/lib/utils";

type BenefitRowProps = {
  icon: ReactNode;
  title: string;
  description: string;
  features: string[];
  imagePlaceholder?: ReactNode;
  imagePosition?: "left" | "right";
  className?: string;
};

const BenefitRow = ({
  icon,
  title,
  description,
  features,
  imagePlaceholder,
  imagePosition = "left",
  className,
}: BenefitRowProps) => {
  const imageContent = (
    <div className="group relative flex min-h-64 items-center justify-center overflow-hidden rounded-xl sm:min-h-80 lg:h-87.5">
      {imagePlaceholder || (
        <span className="text-sm text-muted-foreground">Image placeholder</span>
      )}
      {/* Icon overlay for mobile only */}
      <div className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-2xl border border-border/50 bg-white/95 shadow-md backdrop-blur-sm transition-transform duration-300 group-hover:scale-[1.02] lg:hidden">
        {icon}
      </div>
    </div>
  );

  const textContent = (
    <div className="space-y-4 sm:space-y-5">
      {/* Icon for desktop only */}
      <div className="hidden h-12 w-12 items-center justify-center rounded-xl bg-primary/10 lg:flex">
        {icon}
      </div>
      <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-[1.875rem] lg:leading-9">
        {title}
      </h3>
      <p className="text-sm leading-7 text-muted-foreground/70 sm:text-base lg:text-lg">
        {description}
      </p>
      <ul className="space-y-2 pt-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <CircleCheck className="h-5 w-5 shrink-0 text-foreground" />
            <span className="text-base text-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div
      className={cn(
        "grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16",
        className,
      )}
    >
      {/* Mobile: always image on top, text below */}
      <div className="lg:hidden">
        {imageContent}
        <div className="mt-6 sm:mt-8">{textContent}</div>
      </div>

      {/* Desktop: respect imagePosition */}
      {imagePosition === "left" ? (
        <>
          <div className="hidden lg:block">{imageContent}</div>
          <div className="hidden lg:block">{textContent}</div>
        </>
      ) : (
        <>
          <div className="hidden lg:block">{textContent}</div>
          <div className="hidden lg:block">{imageContent}</div>
        </>
      )}
    </div>
  );
};

export default BenefitRow;
