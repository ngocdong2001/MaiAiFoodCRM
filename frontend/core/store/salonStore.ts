"use client";

import { create } from "zustand";

/** Default salon logo used as the app avatar when no custom logo is set. */
export const DEFAULT_SALON_LOGO =
  "https://cdn.visily.ai/text2design/images/f9ee91517509e4e6e67d8ada44cd8b7e3ecad22982df622d56bd6d80ad4d0983.webp";

const SALON_CACHE_KEY = "maiai-salon-cache";
/** Tenant name persists across logout so the login page always shows it. */
const SALON_NAME_KEY = "maiai-salon-name";

export type CachedSalonSettings = {
  salonName: string;
  businessType: string;
  email: string;
  phone: string;
  address: string;
  timezone: string;
};

/**
 * App-wide salon identity (name + logo + full business profile), shared between
 * the dashboard header and the settings screens. On first load the cached
 * business profile is restored from localStorage so the UI is populated
 * immediately; a fresh fetch from the API then keeps it in sync.
 */
type SalonState = {
  salonName: string;
  logoUrl: string;
  /** Full cached business profile (persisted to localStorage). */
  cachedProfile: CachedSalonSettings | null;
  hydrated: boolean;
  setSalon: (salonName: string, logoUrl?: string) => void;
  /** Restore salon profile from localStorage (called once on app init). */
  hydrateSalon: () => void;
  /** Persist the full salon profile to localStorage + update state. */
  cacheSalonProfile: (settings: CachedSalonSettings) => void;
  /** Clear the cached salon profile (on logout). */
  clearSalonCache: () => void;
};

const readCache = (): CachedSalonSettings | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SALON_CACHE_KEY);
    return raw ? (JSON.parse(raw) as CachedSalonSettings) : null;
  } catch {
    localStorage.removeItem(SALON_CACHE_KEY);
    return null;
  }
};

export const useSalonStore = create<SalonState>((set, get) => ({
  salonName: "",
  logoUrl: DEFAULT_SALON_LOGO,
  cachedProfile: null,
  hydrated: false,

  hydrateSalon: () => {
    if (get().hydrated) return;
    const cached = readCache();
    // Prefer full cached profile, fall back to the persistent name key
    const persistentName =
      typeof window !== "undefined"
        ? localStorage.getItem(SALON_NAME_KEY) || ""
        : "";
    set({
      hydrated: true,
      cachedProfile: cached,
      salonName: cached?.salonName || persistentName || get().salonName,
    });
  },

  setSalon: (salonName, logoUrl) => {
    if (salonName && typeof window !== "undefined") {
      localStorage.setItem(SALON_NAME_KEY, salonName);
    }
    set({ salonName: salonName || "", logoUrl: logoUrl || DEFAULT_SALON_LOGO });
  },

  cacheSalonProfile: (settings) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SALON_CACHE_KEY, JSON.stringify(settings));
      // Persist the name separately so it survives logout + cache clear
      if (settings.salonName) {
        localStorage.setItem(SALON_NAME_KEY, settings.salonName);
      }
    }
    set({
      cachedProfile: settings,
      salonName: settings.salonName || "",
    });
  },

  clearSalonCache: () => {
    // Only reset in-memory state — keep localStorage so the login page
    // still shows the business name/logo after logout.
    set({
      cachedProfile: null,
      salonName: "",
      logoUrl: DEFAULT_SALON_LOGO,
      hydrated: false,
    });
  },
}));
