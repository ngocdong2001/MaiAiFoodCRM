"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import LoginForm from "@/features/landing/components/auth/LoginForm";
import { authService } from "@/features/landing/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = authService.getStoredToken();
    const user = authService.getStoredUser();
    const tenant = authService.getStoredTenant();

    if (token && user && tenant) {
      router.replace("/dashboard/overview");
      return;
    }

    setReady(true);
  }, [router]);

  if (!ready) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <LoginForm />
    </main>
  );
}
