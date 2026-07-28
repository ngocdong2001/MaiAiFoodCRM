"use client";

import { Mic, Smartphone, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { useInView } from "@/shared/hooks/useInView";

import Container from "../layouts/Container";

type FeaturesSectionProps = {
  className?: string;
  id?: string;
};

const FeaturesSection = ({ className, id }: FeaturesSectionProps) => {
  const { t } = useTranslation();
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "relative overflow-hidden py-16 sm:py-20 lg:py-24 transition-all duration-1000",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.75rem]">
            {t("features.title")}
          </h2>
          <p className="mt-2 text-pretty text-sm leading-7 text-muted-foreground sm:mt-3 sm:text-base lg:text-lg">
            {t("features.description")}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:mt-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-10">
          <div
            className={cn(
              "flex flex-col items-center text-center transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "100ms" : "0ms" }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#0055FF]/10">
              <Mic className="h-8 w-8 text-[#0055FF]" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-foreground">
              {t("features.items.voiceChatBooking.title")}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {t("features.items.voiceChatBooking.description")}
            </p>
          </div>

          <div
            className={cn(
              "flex flex-col items-center text-center transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "200ms" : "0ms" }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#FF00A9]/10">
              <TrendingUp className="h-8 w-8 text-[#FF00A9]" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-foreground">
              {t("features.items.smartUpsell.title")}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {t("features.items.smartUpsell.description")}
            </p>
          </div>

          <div
            className={cn(
              "flex flex-col items-center text-center transition-all duration-700 sm:col-span-2 lg:col-span-1",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "300ms" : "0ms" }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
              <Smartphone className="h-8 w-8 text-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-foreground">
              {t("features.items.posIntegration.title")}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {t("features.items.posIntegration.description")}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default FeaturesSection;
