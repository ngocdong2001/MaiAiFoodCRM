"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

type ErrorPageProps = {
  statusCode?: number;
  title?: string;
  description?: string;
  /** Optional internal error detail shown in a muted block (dev/debug aid). */
  detail?: string;
  reset?: () => void;
};

const ErrorPage = ({
  statusCode,
  title,
  description,
  detail,
  reset,
}: ErrorPageProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEF2F2] text-[#B91C1C]">
        <AlertTriangle className="h-8 w-8" />
      </div>

      {statusCode ? (
        <p className="mt-6 text-5xl font-bold text-[#171A21]">{statusCode}</p>
      ) : null}

      <h1 className="mt-3 text-2xl font-bold text-[#171A21]">
        {title ?? t("errors.title")}
      </h1>

      <p className="mt-2 max-w-md text-sm leading-relaxed text-[#6B7280]">
        {description ?? t("errors.description")}
      </p>

      {detail ? (
        <code className="mt-4 max-w-lg break-all rounded-lg border border-[#EEF0F3] bg-[#F9FAFB] px-4 py-3 text-xs text-[#8D95A5]">
          {detail}
        </code>
      ) : null}

      <div className="mt-8 flex items-center gap-3">
        {reset ? (
          <Button variant="default" onClick={reset} className="gap-2 px-4">
            <RefreshCw className="h-4 w-4" />
            {t("errors.retry")}
          </Button>
        ) : null}
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/")}
          className="gap-2 border-[#DEE1E7] bg-white px-4 text-[#171A21]"
        >
          <Home className="h-4 w-4" />
          {t("errors.home")}
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage;
