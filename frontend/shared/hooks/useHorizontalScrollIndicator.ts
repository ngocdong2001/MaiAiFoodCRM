"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether a horizontally scrollable container still has content
 * hidden to the right of its current viewport.
 *
 * Returns a ref to attach to the scroll container and a boolean that is
 * `true` while there is more content to the right (i.e. the user can still
 * scroll right). The value is recomputed on scroll, on container/content
 * resize, and whenever `deps` change (e.g. bookings load/change), so it stays
 * accurate for async data and dynamic content.
 */
export function useHorizontalScrollIndicator(
  deps: unknown[] = [],
  threshold = 8,
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [hasMoreRight, setHasMoreRight] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;

    const update = () => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      setHasMoreRight(
        maxScrollLeft > threshold &&
          element.scrollLeft < maxScrollLeft - threshold,
      );
    };

    // Throttle scroll updates to a single rAF per frame.
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    };

    update();
    element.addEventListener("scroll", onScroll, { passive: true });

    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener("scroll", onScroll);
      resizeObserver.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  // Scrolls one viewport-width forward (revealing the next hidden content),
  // clamped to the end of the scrollable area.
  const scrollToNext = () => {
    const element = ref.current;
    if (!element) return;

    const maxScrollLeft = element.scrollWidth - element.clientWidth;
    if (maxScrollLeft <= threshold) return;

    const target = Math.min(
      element.scrollLeft + element.clientWidth * 0.75,
      maxScrollLeft,
    );

    element.scrollTo({ left: target, behavior: "smooth" });
  };

  return { ref, hasMoreRight, scrollToNext };
}