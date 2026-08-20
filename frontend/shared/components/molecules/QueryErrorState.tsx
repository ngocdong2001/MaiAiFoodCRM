"use client";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

type QueryErrorStateProps = {
  message: string;
  retryLabel: string;
  onRetry: () => void;
  className?: string;
};

const QueryErrorState = ({
  message,
  retryLabel,
  onRetry,
  className,
}: QueryErrorStateProps) => {
  return (
    <div
      className={cn(
        "rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive",
        className,
      )}
    >
      <p>{message}</p>
      <Button variant="outline" className="mt-3" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
};

export default QueryErrorState;
