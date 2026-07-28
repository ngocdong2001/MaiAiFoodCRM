"use client";

import { cn } from "@/shared/lib/utils";
import { useInView } from "@/shared/hooks/useInView";
import { useTranslation } from "react-i18next";

import Container from "../layouts/Container";
import RoleCard from "./RoleCard";

type RolesSectionProps = {
  className?: string;
  id?: string;
};

const RolesSection = ({ className, id }: RolesSectionProps) => {
  const { t } = useTranslation();
  const { ref, isInView } = useInView({ threshold: 0.1 });

  const roles = [
    {
      title: t("roles.items.owners.title"),
      subtitle: t("roles.items.owners.subtitle"),
      description: t("roles.items.owners.description"),
      benefits: [
        t("roles.items.owners.benefits.0"),
        t("roles.items.owners.benefits.1"),
        t("roles.items.owners.benefits.2"),
      ],
      checkColor: "blue" as const,
    },
    {
      title: t("roles.items.managers.title"),
      subtitle: t("roles.items.managers.subtitle"),
      description: t("roles.items.managers.description"),
      benefits: [
        t("roles.items.managers.benefits.0"),
        t("roles.items.managers.benefits.1"),
        t("roles.items.managers.benefits.2"),
      ],
      checkColor: "pink" as const,
    },
    {
      title: t("roles.items.nailArtists.title"),
      subtitle: t("roles.items.nailArtists.subtitle"),
      description: t("roles.items.nailArtists.description"),
      benefits: [
        t("roles.items.nailArtists.benefits.0"),
        t("roles.items.nailArtists.benefits.1"),
        t("roles.items.nailArtists.benefits.2"),
      ],
      checkColor: "purple" as const,
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
            {t("roles.title")}
          </h2>
          <p className="mt-3 text-pretty text-base leading-7 text-muted-foreground sm:mt-4 sm:text-lg">
            {t("roles.description")}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {roles.map((role, index) => (
            <div
              key={role.title}
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
              <RoleCard
                title={role.title}
                subtitle={role.subtitle}
                description={role.description}
                benefits={role.benefits}
                checkColor={role.checkColor}
              />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default RolesSection;
