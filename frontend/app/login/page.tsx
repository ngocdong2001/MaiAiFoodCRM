"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import LoginForm from "@/features/landing/components/auth/LoginForm";
import { useAuthStore } from "@/core/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { hydrate, hydrated, token, user } = useAuthStore();

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

  if (!ready) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <LoginForm />
    </main>
  );
}
