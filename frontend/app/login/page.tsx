"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import LoginForm from "@/features/landing/components/auth/LoginForm";
import { useAuthStore } from "@/core/store/authStore";
import { useSalonStore } from "@/core/store/salonStore";

export default function LoginPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { hydrate, hydrated, token, user } = useAuthStore();
  const hydrateSalon = useSalonStore((s) => s.hydrateSalon);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
      return;
    }

    if (token && user) {
      router.replace("/dashboard/overview");
      return;
    }

    setReady(true);
  }, [hydrated, token, user, router, hydrate]);

  // Restore cached salon profile so logo + name are available on login page
  useEffect(() => {
    hydrateSalon();
  }, [hydrateSalon]);

  if (!ready) {
    return null;
  }

  return <LoginForm />;
}
