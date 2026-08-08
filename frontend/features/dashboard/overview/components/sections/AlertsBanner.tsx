"use client";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const AlertsBanner = () => {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-[#F7C6E4] bg-linear-to-r from-[#FDF0F8] to-[#FCE7F3] p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-sm font-semibold text-[#171A21]">
            {t("dashboard.overview.alerts.title")}
          </p>
          <p className="mt-1 text-sm text-[#6B7280]">
            {t("dashboard.overview.alerts.message")}{" "}
            <a href="#" className="font-medium text-primary hover:underline">
              {t("dashboard.overview.alerts.reviewSettings")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default AlertsBanner;
