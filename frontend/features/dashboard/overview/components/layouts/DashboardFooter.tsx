"use client";

import { useTranslation } from "react-i18next";

import DashboardContainer from "./DashboardContainer";

const DashboardFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[#DEE1E7] bg-[#F9FAFB]">
      <DashboardContainer className="flex flex-col items-center justify-between gap-2 py-5 text-sm text-[#8D95A5] sm:flex-row">
        <p>{t("dashboard.footer.copyright")}</p>
        <div className="flex items-center gap-6">
          <a href="#" className="transition-colors hover:text-primary">
            {t("dashboard.footer.support")}
          </a>
          <a href="#" className="transition-colors hover:text-primary">
            {t("dashboard.footer.termsOfService")}
          </a>
        </div>
      </DashboardContainer>
    </footer>
  );
};

export default DashboardFooter;
