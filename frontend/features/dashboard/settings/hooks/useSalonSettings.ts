"use client";

import { useEffect } from "react";

import { useSalonStore } from "@/core/store/salonStore";

import { settingsService } from "../services/settings.service";

/**
 * Loads the salon's business profile once and keeps the global salon identity
 * in sync so the dashboard header reflects the configured salon name.
 *
 * Strategy: the cached profile (from localStorage) is already hydrated into the
 * store by `AuthProvider`.  This hook then fires an API call in the background
 * to get the freshest data and updates both the store and the cache.
 */
export const useSalonSettings = () => {
  const setSalon = useSalonStore((state) => state.setSalon);
  const cacheSalonProfile = useSalonStore((state) => state.cacheSalonProfile);

  useEffect(() => {
    let cancelled = false;
    settingsService
      .getSalonSettings()
      .then((settings) => {
        if (!cancelled) {
          setSalon(settings.salonName || "");
          // Keep the localStorage cache fresh with the latest API data
          cacheSalonProfile(settings);
        }
      })
      .catch(() => {
        /* keep defaults / cached values on error */
      });
    return () => {
      cancelled = true;
    };
  }, [setSalon, cacheSalonProfile]);
};
