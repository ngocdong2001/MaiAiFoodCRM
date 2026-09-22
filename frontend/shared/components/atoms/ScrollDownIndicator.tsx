"use client";

import { ArrowDown } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";

type ScrollDownIndicatorProps = {
  containerRef: RefObject<HTMLDivElement | null>;
};

const ScrollDownIndicator = ({ containerRef }: ScrollDownIndicatorProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateVisibility = () => {
      const remainingScroll =
        container.scrollHeight - container.clientHeight - container.scrollTop;
      setVisible(remainingScroll > 12);
    };

    updateVisibility();
    container.addEventListener("scroll", updateVisibility, { passive: true });

    const resizeObserver = new ResizeObserver(updateVisibility);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener("scroll", updateVisibility);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  const handleClick = () => {
    const container = containerRef.current;
    if (!container) return;

    const remainingScroll =
      container.scrollHeight - container.clientHeight - container.scrollTop;

    if (remainingScroll <= 0) return;

    const targetTop = Math.min(
      container.scrollTop + Math.max(container.clientHeight * 0.7, 180),
      container.scrollHeight - container.clientHeight,
    );

    container.scrollTo({
      top: targetTop,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Scroll to more content"
      onClick={handleClick}
      className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#DEE1E7] bg-white/95 text-primary shadow-[0px_6px_16px_0px_#00000014] backdrop-blur-sm transition-transform hover:scale-105"
    >
      <ArrowDown className="h-4 w-4" />
    </button>
  );
};

export default ScrollDownIndicator;
