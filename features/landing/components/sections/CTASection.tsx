"use client";

import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { useInView } from "@/shared/hooks/useInView";

import Container from "../layouts/Container";

type CTASectionProps = {
  className?: string;
  id?: string;
  onSignUpClick?: () => void;
};

const CTASection = ({ className, id, onSignUpClick }: CTASectionProps) => {
  const { t } = useTranslation();
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section
      id={id}
      ref={ref}
      className={cn(
        "relative py-12 sm:py-16 lg:py-20 transition-all duration-1000",
        isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      <Container>
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-xl bg-linear-to-br from-[#0055FF]/40 via-[#F9FAFB]/80 to-[#FF00A9]/40 px-5 py-6 shadow-[0_10px_24px_rgba(0,0,0,0.12)] sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          {/* Decorative blur effect */}
          <div className="absolute -right-12 -top-16 size-64 rounded-full bg-[#0055FF]/30 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-balance text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {t("cta.title")}
            </h2>

            <p className="mt-2 max-w-xl text-pretty text-sm leading-6 text-muted-foreground sm:mt-3 sm:text-base">
              {t("cta.description")}
            </p>

            <button
              type="button"
              onClick={onSignUpClick}
              className="mt-5 w-full rounded-xl bg-[#0055FF] px-8 py-4 text-base font-medium text-white shadow-xl transition-all hover:bg-[#0055FF]/90 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0055FF] sm:mt-6 sm:w-auto sm:min-w-60"
            >
              {t("cta.signUp")}
            </button>

            <div className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
              <Sparkles className="size-4 text-[#FF00A9]" />
              <span>{t("cta.priority")}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
