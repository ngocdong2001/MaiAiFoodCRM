"use client";

import { cn } from "@/shared/lib/utils";
import { useInView } from "@/shared/hooks/useInView";
import { useTranslation } from "react-i18next";

import Container from "../layouts/Container";
import StepCard from "./StepCard";

type HowItWorksSectionProps = {
  className?: string;
  id?: string;
};

const HowItWorksSection = ({ className, id }: HowItWorksSectionProps) => {
  const { t } = useTranslation();
  const { ref, isInView } = useInView({ threshold: 0.1 });

  const steps = [
    {
      number: 1,
      color: "blue" as const,
      title: t("howItWorks.steps.0.title"),
      description: t("howItWorks.steps.0.description"),
    },
    {
      number: 2,
      color: "pink" as const,
      title: t("howItWorks.steps.1.title"),
      description: t("howItWorks.steps.1.description"),
    },
    {
      number: 3,
      color: "green" as const,
      title: t("howItWorks.steps.2.title"),
      description: t("howItWorks.steps.2.description"),
    },
  ];

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
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.75rem]">
            {t("howItWorks.title")}
          </h2>
          <p className="mt-3 text-pretty text-base leading-7 text-muted-foreground sm:mt-4 sm:text-lg">
            {t("howItWorks.description")}
          </p>
        </div>

        <div className="mt-16 grid gap-12 sm:grid-cols-2 sm:mt-20 lg:mt-24 lg:grid-cols-3 lg:gap-8 lg:items-stretch">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className={cn(
                "transition-all duration-700",
                isInView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8",
              )}
              style={{
                transitionDelay: isInView ? `${(index + 1) * 150}ms` : "0ms",
              }}
            >
              <StepCard
                stepNumber={step.number}
                title={step.title}
                description={step.description}
                badgeColor={step.color}
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default HowItWorksSection;
