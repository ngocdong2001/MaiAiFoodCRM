"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/core/store/authStore";
import { useQueueEventsSubscription } from "@/features/dashboard/overview/hooks/useOverview";

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
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

    setReady(true);
  }, [hydrated, token, user, router, hydrate]);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
