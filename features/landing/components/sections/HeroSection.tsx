"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import heroImage from "@/assets/images/hero_landingpage_1.png";
import heroImageVi from "@/assets/images/hero_landingpage_1_TV.png";
import PlanCard from "@/shared/components/ui/plan-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import EarlyAccessForm from "@/features/landing/components/shared/EarlyAccessForm";

import { cn } from "@/shared/lib/utils";

import Container from "../layouts/Container";

type HeroSectionProps = {
  className?: string;
  id?: string;
};

const HeroSection = ({ className, id }: HeroSectionProps) => {
  const { t, i18n } = useTranslation();
  const heroImageSrc = i18n.language === "vi" ? heroImageVi : heroImage;
  const [isVisible, setIsVisible] = useState(false);
  const [isThankYouOpen, setIsThankYouOpen] = useState(false);

  useEffect(() => {
    // Trigger animation shortly after mount
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id={id}
      className={cn("relative overflow-hidden py-14 lg:py-20", className)}
    >
      <div className="pointer-events-none absolute -left-36 -top-25.75 h-125 w-125 rounded-full bg-primary/15 blur-3xl dark:bg-primary/10" />
      <div className="pointer-events-none absolute -right-32 -bottom-28 h-150 w-150 rounded-full bg-[#FF00A926] blur-3xl" />

      <Container className="relative">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:gap-14">
          <div className="max-w-140">
            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary shadow-sm dark:border-primary/20 dark:bg-primary/15 transition-all duration-700",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8",
              )}
              style={{ transitionDelay: isVisible ? "100ms" : "0ms" }}
            >
              <Sparkles size={14} />
              {t("hero.badge")}
            </div>

            <div
              className={cn(
                "mt-7 space-y-5 transition-all duration-700",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8",
              )}
              style={{ transitionDelay: isVisible ? "200ms" : "0ms" }}
            >
              <h1 className="text-balance text-3xl font-bold leading-[1.08] tracking-tight text-[#1D2433] sm:text-4xl lg:text-5xl">
                {t("hero.titleLine1")}{" "}
                <span className="bg-linear-to-r from-[#1F53FF] via-[#6B39E8] to-[#D61AA7] bg-clip-text text-transparent">
                  {t("hero.titleHighlight")}
                </span>
              </h1>
              <p className="text-sm font-normal leading-7 text-muted-foreground sm:text-base lg:text-lg">
                {t("hero.description")}
              </p>
            </div>

            <div
              className={cn(
                "transition-all duration-700",
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8",
              )}
              style={{ transitionDelay: isVisible ? "300ms" : "0ms" }}
            >
              <PlanCard className="mt-6 sm:mt-8">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-2xl">
                    {t("hero.form.title")}
                  </h2>
                  <p className="text-xs font-normal text-muted-foreground sm:text-sm">
                    {t("hero.form.subtitle")}
                  </p>
                </div>

                <EarlyAccessForm onSuccess={() => setIsThankYouOpen(true)} />
              </PlanCard>
            </div>
          </div>

          <div
            className={cn(
              "relative hidden items-center justify-center lg:flex lg:min-h-160 lg:scale-110 origin-center transition-all duration-700",
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8",
            )}
            style={{ transitionDelay: isVisible ? "400ms" : "0ms" }}
          >
            <Image
              loading="eager"
              src={heroImageSrc}
              alt={t("hero.imageAlt")}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      </Container>

      <AlertDialog open={isThankYouOpen} onOpenChange={setIsThankYouOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-primary/10 text-primary">
              <Sparkles />
            </AlertDialogMedia>
            <AlertDialogTitle>{t("hero.form.thankYouTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("hero.form.thankYouDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsThankYouOpen(false)}>
              {t("hero.form.thankYouClose")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default HeroSection;
