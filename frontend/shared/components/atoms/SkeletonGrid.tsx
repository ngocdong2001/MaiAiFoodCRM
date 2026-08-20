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
  return (
    <div className={cn("grid grid-cols-1 gap-5", className)}>
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
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
