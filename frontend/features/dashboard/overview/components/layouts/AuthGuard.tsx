"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAuthStore } from "@/core/store/authStore";
import { useQueueEventsSubscription } from "@/features/dashboard/overview/hooks/useOverview";

// Pages restricted to admin role.
const RESTRICTED_PREFIXES = [
  "/dashboard/revenue",
  "/dashboard/reports",
  "/dashboard/services",
];

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const { hydrate, hydrated, token, user } = useAuthStore();

  useQueueEventsSubscription();

  useEffect(() => {
    if (!hydrated) {
      hydrate();
      return;
    }

    if (!token || !user) {
      router.replace("/login");
      return;
    }

    // Block non-admin from restricted pages.
    const isRestricted = RESTRICTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    if (isRestricted && user.role !== "admin") {
      router.replace("/dashboard/overview");
      return;
    }

    setReady(true);
  }, [hydrated, token, user, pathname, router, hydrate]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
