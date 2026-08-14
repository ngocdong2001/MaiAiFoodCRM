"use client";

import { useEffect, type ReactNode } from "react";

import { authService } from "@/features/landing/services/auth.service";
import { useAuthStore } from "@/core/store/authStore";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
    void authService.refreshCurrentUser();
  }, [hydrate]);

  return children;
};