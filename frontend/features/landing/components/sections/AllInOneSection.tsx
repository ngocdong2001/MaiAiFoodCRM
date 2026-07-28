"use client";

import {
  BellRing,
  CalendarDays,
  ChartLine,
  CircleUser,
  Scissors,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { useInView } from "@/shared/hooks/useInView";

import Container from "../layouts/Container";
import FeatureCard from "./FeatureCard";

type AllInOneSectionProps = {
  className?: string;
  id?: string;
};

const AllInOneSection = ({ className, id }: AllInOneSectionProps) => {
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
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-[2.75rem]">
            {t("allInOne.title")}
          </h2>
          <p className="mt-2 text-pretty text-sm leading-7 text-muted-foreground sm:mt-3 sm:text-base lg:text-lg">
            {t("allInOne.description")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 items-stretch">
          <div
            className={cn(
              "h-full transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "100ms" : "0ms" }}
          >
            <FeatureCard
              icon={<CalendarDays className="h-6 w-6 text-destructive" />}
              title={t("allInOne.items.booking.title")}
              description={t("allInOne.items.booking.description")}
            />
          </div>
          <div
            className={cn(
              "h-full transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "200ms" : "0ms" }}
          >
            <FeatureCard
              icon={<CircleUser className="h-6 w-6 text-emerald-600" />}
              title={t("allInOne.items.preference.title")}
              description={t("allInOne.items.preference.description")}
            />
          </div>
          <div
            className={cn(
              "h-full transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "300ms" : "0ms" }}
          >
            <FeatureCard
              icon={<Scissors className="h-6 w-6 text-primary" />}
              title={t("allInOne.items.stylistMatching.title")}
              description={t("allInOne.items.stylistMatching.description")}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 items-stretch">
          <div
            className={cn(
              "h-full transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "400ms" : "0ms" }}
          >
            <FeatureCard
              icon={<BellRing className="h-6 w-6 text-blue-500" />}
              title={t("allInOne.items.nudges.title")}
              description={t("allInOne.items.nudges.description")}
            />
          </div>
          <div
            className={cn(
              "h-full transition-all duration-700",
              isInView
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8",
            )}
            style={{ transitionDelay: isInView ? "500ms" : "0ms" }}
          >
            <FeatureCard
              icon={<ChartLine className="h-6 w-6" />}
              title={t("allInOne.items.dashboard.title")}
              description={t("allInOne.items.dashboard.description")}
            />
          </div>
        </div>
      </Container>
    </section>
  );
};

export default AllInOneSection;
