"use client";

import { useEffect } from "react";

import { useSalonStore } from "@/core/store/salonStore";

import { settingsService } from "../services/settings.service";

/**
 * Loads the salon's business profile once and keeps the global salon identity
 * (name/logo) in sync so the dashboard header reflects the configured salon name.
 */
export const useSalonSettings = () => {
  const setSalon = useSalonStore((state) => state.setSalon);

  useEffect(() => {
    let cancelled = false;
    settingsService
      .getSalonSettings()
      .then((settings) => {
        if (!cancelled) setSalon(settings.salonName || "");
      })
      .catch(() => {
        /* keep defaults on error */
      });
    return () => {
      cancelled = true;
    };
  }, [setSalon]);
};
