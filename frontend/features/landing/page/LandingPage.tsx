"use client";

import { useState } from "react";

import LandingFooter from "../components/layouts/LandingFooter";
import LandingHeader from "../components/layouts/LandingHeader";
import EarlyAccessDialog from "../components/shared/EarlyAccessDialog";
import AllInOneSection from "../components/sections/AllInOneSection";
import BenefitsSection from "../components/sections/BenefitsSection";
import CTASection from "../components/sections/CTASection";
import FAQSection from "../components/sections/FAQSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import HeroSection from "../components/sections/HeroSection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import RolesSection from "../components/sections/RolesSection";

const LandingPage = () => {
  const [isEarlyAccessDialogOpen, setIsEarlyAccessDialogOpen] = useState(false);

  const sections = [
    { id: "hero", Component: HeroSection },
    { id: "features", Component: FeaturesSection },
    { id: "benefits", Component: BenefitsSection },
    { id: "all-in-one", Component: AllInOneSection },
    { id: "how-it-works", Component: HowItWorksSection },
    { id: "roles", Component: RolesSection },
    { id: "cta", Component: CTASection },
    { id: "faq", Component: FAQSection },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingHeader onSignUpClick={() => setIsEarlyAccessDialogOpen(true)} />

      {sections.map(({ id, Component }, index) => {
        const bgClass = index % 2 === 0 ? "bg-background" : "bg-muted/30";

        if (id === "cta") {
          return (
            <CTASection
              key={id}
              id={id}
              className={bgClass}
              onSignUpClick={() => setIsEarlyAccessDialogOpen(true)}
            />
          );
        }

        return <Component key={id} id={id} className={bgClass} />;
      })}

      <EarlyAccessDialog
        open={isEarlyAccessDialogOpen}
        onOpenChange={setIsEarlyAccessDialogOpen}
      />

      <LandingFooter />
    </main>
  );
};

export default LandingPage;
