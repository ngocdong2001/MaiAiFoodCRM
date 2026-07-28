"use client";

import { Clock, MessageSquareHeart, TrendingUp } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { useInView } from "@/shared/hooks/useInView";

import heroImage2 from "@/assets/images/hero_landingpage_2.png";
import heroImage3 from "@/assets/images/hero_landingpage_3.png";
import heroImage4 from "@/assets/images/hero_landingpage_4.png";
import Container from "../layouts/Container";
import BenefitRow from "./BenefitRow";

type BenefitsSectionProps = {
  className?: string;
  id?: string;
};

const BenefitsSection = ({ className, id }: BenefitsSectionProps) => {
  const { t } = useTranslation();
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "relative py-16 sm:py-20 lg:py-24 transition-all duration-1000",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      <Container>
        <div className="mx-auto max-w-5xl text-center">
          <h2 className=" text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.75rem]">
            {t("benefits.title")}
          </h2>
          <p className="mt-3 text-pretty text-base leading-6 text-muted-foreground/70 sm:mt-4 sm:text-base lg:text-lg">
            {t("benefits.description")}
          </p>
        </div>

        <div className="mt-12 space-y-16 sm:mt-16 sm:space-y-20 lg:mt-20 lg:space-y-20">
          <div
            className={cn(
              "transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "200ms" : "0ms" }}
          >
            <BenefitRow
              imagePlaceholder={
                <Image
                  src={heroImage2}
                  alt={t("benefits.items.saveTime.imageAlt")}
                  className="h-full w-full rounded-lg object-contain shadow-xl transition-transform duration-300 hover:scale-[1.02]"
                />
              }
              icon={
                <Clock className="h-5 w-5 text-[#7A4CE6] lg:h-6 lg:w-6 lg:text-[#0055FF]" />
              }
              title={t("benefits.items.saveTime.title")}
              description={t("benefits.items.saveTime.description")}
              features={[
                t("benefits.items.saveTime.features.0"),
                t("benefits.items.saveTime.features.1"),
                t("benefits.items.saveTime.features.2"),
              ]}
              imagePosition="left"
            />
          </div>

          <div
            className={cn(
              "transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "400ms" : "0ms" }}
          >
            <BenefitRow
              imagePlaceholder={
                <Image
                  src={heroImage3}
                  alt={t("benefits.items.increaseRevenue.imageAlt")}
                  className="h-full w-full rounded-lg object-contain shadow-xl transition-transform duration-300 hover:scale-[1.02]"
                />
              }
              icon={
                <TrendingUp className="h-5 w-5 text-[#7A4CE6] lg:h-6 lg:w-6 lg:text-[#FF00A9]" />
              }
              title={t("benefits.items.increaseRevenue.title")}
              description={t("benefits.items.increaseRevenue.description")}
              features={[
                t("benefits.items.increaseRevenue.features.0"),
                t("benefits.items.increaseRevenue.features.1"),
                t("benefits.items.increaseRevenue.features.2"),
              ]}
              imagePosition="right"
            />
          </div>

          <div
            className={cn(
              "transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "600ms" : "0ms" }}
          >
            <BenefitRow
              imagePlaceholder={
                <Image
                  src={heroImage4}
                  alt={t("benefits.items.personalizedExperience.imageAlt")}
                  className="h-full w-full rounded-lg object-contain shadow-xl transition-transform duration-300 hover:scale-[1.02]"
                />
              }
              icon={
                <MessageSquareHeart className="h-5 w-5 text-[#7A4CE6] lg:h-6 lg:w-6 lg:text-[#FF00A9]" />
              }
              title={t("benefits.items.personalizedExperience.title")}
              description={t(
                "benefits.items.personalizedExperience.description",
              )}
              features={[
                t("benefits.items.personalizedExperience.features.0"),
                t("benefits.items.personalizedExperience.features.1"),
                t("benefits.items.personalizedExperience.features.2"),
              ]}
              imagePosition="left"
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default BenefitsSection;
