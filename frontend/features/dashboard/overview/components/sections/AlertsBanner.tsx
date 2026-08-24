"use client";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

const AlertsBanner = () => {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-[#FEF1F8] p-4 shadow-[0px_4px_8px_0px_#F04CAC0d,_0px_1px_2px_0px_#F04CAC0d]">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#7F0A4F]" />
        <div>
          <p className="text-base font-semibold text-[#7F0A4F]">
            {t("dashboard.overview.alerts.title")}
          </p>
          <p className="mt-1 text-sm text-[#8D95A5]">
            {t("dashboard.overview.alerts.message")}{" "}
            <a href="#" className="font-medium text-[#7F0A4F] hover:underline">
              {t("dashboard.overview.alerts.reviewSettings")}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default AlertsBanner;
