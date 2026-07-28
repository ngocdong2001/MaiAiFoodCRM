"use client";

import { useTranslation } from "react-i18next";

import Container from "./Container";
import Logo from "@/shared/components/atoms/logo";

const productLinkKeys = ["features", "faq"] as const;
const companyLinkKeys = ["contact", "about"] as const;
const legalLinkKeys = ["privacyPolicy", "termsOfServices"] as const;

const LandingFooter = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-background">
      <Container className="py-10 text-sm text-muted-foreground sm:px-0 lg:px-0">
        <div className="py-4 lg:hidden">
          <div className="flex items-center gap-3">
            <Logo />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 border-b border-border py-4 sm:gap-10 lg:grid-cols-4">
          <div className="hidden lg:block">
            <div className="max-w-xl ">
              <Logo />
              <p className="text-sm leading-6 sm:text-base">
                {t("footer.tagline")}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              {t("footer.columns.product")}
            </h3>
            <ul className="mt-4 space-y-3">
              {productLinkKeys.map((key) => (
                <li key={key}>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                  >
                    {t(`footer.productLinks.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              {t("footer.columns.company")}
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinkKeys.map((key) => (
                <li key={key}>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                  >
                    {t(`footer.companyLinks.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:block">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground">
              {t("footer.columns.legal")}
            </h3>
            <ul className="mt-4 space-y-3">
              {legalLinkKeys.map((key) => (
                <li key={key}>
                  <a
                    href="#"
                    className="transition-colors hover:text-foreground"
                  >
                    {t(`footer.legalLinks.${key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("footer.copyright")}</p>
          <p>{t("footer.designedFor")}</p>
        </div>
      </Container>
    </footer>
  );
};

export default LandingFooter;
