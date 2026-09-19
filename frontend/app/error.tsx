"use client";

import ErrorPage from "@/shared/components/molecules/ErrorPage";

// Route-level error boundary. Catches errors thrown in pages/layouts below the
// root layout and renders a friendly error screen instead of a raw error.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorPage detail={error.message} reset={reset} />;
}
