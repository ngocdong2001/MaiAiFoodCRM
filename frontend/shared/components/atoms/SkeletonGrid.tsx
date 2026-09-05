"use client";

import { useMemo } from "react";

import { cn } from "@/shared/lib/utils";

type SkeletonGridProps = {
  count: number;
  className?: string;
  itemClassName?: string;
};

const SkeletonGrid = ({
  count,
  className,
  itemClassName,
}: SkeletonGridProps) => {
  // Placeholders carry no identity of their own, so mint stable ids once per count.
  const ids = useMemo(
    () => Array.from({ length: count }, () => crypto.randomUUID()),
    [count],
  );

  return (
    <div className={cn("grid grid-cols-1 gap-5", className)}>
      {ids.map((id) => (
        <div
          key={id}
          className={cn(
            "h-24 animate-pulse rounded-xl border border-[#DEE1E7] bg-white",
            itemClassName,
          )}
        />
      ))}
    </div>
  );
};

export default SkeletonGrid;
