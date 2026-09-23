"use client";

import { useEffect, type ReactNode } from "react";

import { authService } from "@/features/landing/services/auth.service";
import { useAuthStore } from "@/core/store/authStore";
import { useSalonStore } from "@/core/store/salonStore";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hydrateSalon = useSalonStore((state) => state.hydrateSalon);

  useEffect(() => {
    // Restore auth session from storage
    hydrate();
    // Restore salon business profile from localStorage cache
    hydrateSalon();
    // Validate token with backend (also refreshes salon if token valid)
    void authService.refreshCurrentUser();
  }, [hydrate, hydrateSalon]);

  return children;
};