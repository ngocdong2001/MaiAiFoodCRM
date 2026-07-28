import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

const Container = ({ children, className }: ContainerProps) => {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-6 sm:px-8 lg:px-12 xl:px-16 2xl:px-20",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Container;
