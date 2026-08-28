"use client";

import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/lib/utils";

type LoadingStateProps = {
  label?: string;
  className?: string;
  /** Render a compact spinner-only variant (no label). */
  compact?: boolean;
};

/**
 * Shared loading indicator: a centered spinner with an optional label.
 * Use inside sections/cards while async data is pending.
 */
const LoadingState = ({
  label,
  className,
  compact = false,
}: LoadingStateProps) => (
  <div
    className={cn(
      "flex items-center justify-center gap-2 text-sm text-[#8D95A5]",
      compact ? "py-2" : "py-8",
      className,
    )}
  >
    <Spinner className="size-4" />
    {!compact && label ? <span>{label}</span> : null}
  </div>
);

export default LoadingState;
