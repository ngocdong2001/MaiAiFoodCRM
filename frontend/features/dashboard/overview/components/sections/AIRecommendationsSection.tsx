"use client";
import { useTranslation } from "react-i18next";

import { aiRecommendations } from "@/features/dashboard/overview/data/data";

const AIRecommendationsSection = () => {
  const { t } = useTranslation();

  return (
    <section className="rounded-xl border border-[#E4DAF5] bg-[#FBFAFE] p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <h2 className="text-base font-semibold text-[#171A21]">
        {t("dashboard.overview.aiRecommendations.title")}
      </h2>
      <p className="mt-0.5 text-sm text-[#8D95A5]">
        {t("dashboard.overview.aiRecommendations.subtitle")}
      </p>

      <ul className="mt-4 space-y-3">
        {aiRecommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <li
              key={rec.key}
              className="flex items-start justify-between gap-3 rounded-lg border border-[#EDE7F7] bg-white p-3"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0E7FD]">
                  <Icon className="h-4 w-4 text-[#8A4CE0]" />
                </span>
                <div>
                  <p className="text-sm font-medium text-[#171A21]">
                    {t(
                      `dashboard.overview.aiRecommendations.items.${rec.key}.title`,
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-[#8D95A5]">
                    {t(
                      `dashboard.overview.aiRecommendations.items.${rec.key}.description`,
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-lg border border-[#DEE1E7] bg-white px-3 py-1.5 text-xs font-medium text-[#171A21] transition-colors hover:bg-[#F9FAFB]"
              >
                {t("dashboard.overview.aiRecommendations.action")}
              </button>
            </li>
          );
        })}
      </ul>

      <a
        href="#"
        className="mt-4 block text-center text-sm font-medium text-[#8A4CE0] hover:underline"
      >
        {t("dashboard.overview.aiRecommendations.manage")}
      </a>
    </section>
  );
};

export default AIRecommendationsSection;
