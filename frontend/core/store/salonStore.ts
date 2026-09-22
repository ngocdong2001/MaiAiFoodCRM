"use client";

import { create } from "zustand";

/** Default salon logo used as the app avatar when no custom logo is set. */
export const DEFAULT_SALON_LOGO =
  "https://cdn.visily.ai/text2design/images/f9ee91517509e4e6e67d8ada44cd8b7e3ecad22982df622d56bd6d80ad4d0983.webp";

/**
 * App-wide salon identity (name + logo), shared between the dashboard header
 * and the settings screens so that edits to the business profile are reflected
 * in the application title/logo immediately.
 */
type SalonState = {
  salonName: string;
  logoUrl: string;
  setSalon: (salonName: string, logoUrl?: string) => void;
};

export const useSalonStore = create<SalonState>((set) => ({
  salonName: "",
  logoUrl: DEFAULT_SALON_LOGO,
  setSalon: (salonName, logoUrl) =>
    set({ salonName, logoUrl: logoUrl || DEFAULT_SALON_LOGO }),
}));
