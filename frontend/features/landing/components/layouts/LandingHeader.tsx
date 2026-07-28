"use client";

import Link from "next/link";
import React from "react";
import { useTranslation } from "react-i18next";

import Container from "./Container";
import Logo from "@/shared/components/atoms/logo";
import PrimaryButton from "@/shared/components/molecules/button/PrimaryButton";
import LanguageSwitcher from "@/core/lang/components/LanguageSwitcher";

const navItems = [
  { key: "features", href: "#features" },
  { key: "howItWorks", href: "#how-it-works" },
  { key: "faq", href: "#faq" },
];

type LandingHeaderProps = {
  onSignUpClick: () => void;
};

const LandingHeader = ({ onSignUpClick }: LandingHeaderProps) => {
  const { t } = useTranslation();
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute("href");
    if (href) {
      const element = document.querySelector(href);
      if (element) {
        const headerOffset = 80; // Height of sticky header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="shrink-0 md:justify-self-start">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-6 justify-self-center text-sm font-semibold text-muted-foreground md:flex">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={handleNavClick}
              className="transition-colors hover:text-primary"
            >
              {t(`header.nav.${item.key}`)}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3 md:justify-self-end">
          <LanguageSwitcher />
          <PrimaryButton label={t("header.signUp")} onClick={onSignUpClick} />
        </div>
      </Container>
    </header>
  );
};

export default LandingHeader;
