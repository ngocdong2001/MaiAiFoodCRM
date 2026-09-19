"use client";

import ErrorPage from "@/shared/components/molecules/ErrorPage";

// Global error boundary (App Router). It catches errors thrown anywhere in
// the tree — including the root layout — so a thrown error renders here
// instead of leaking a raw error/stack into the page. Since this replaces the
// root layout, it must render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <ErrorPage detail={error.message} reset={reset} />
      </body>
    </html>
  );
}
