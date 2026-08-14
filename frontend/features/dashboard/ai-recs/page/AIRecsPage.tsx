"use client";

import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

import { aiStats, aiSuggestions, defaultCampaign } from "../data/data";
import type { AISuggestion } from "../types/ai-recs.types";
import ActionableInsightsSection from "../components/sections/ActionableInsightsSection";
import AIRecsStatsSection from "../components/sections/AIRecsStatsSection";
import UpsellComposerSection from "../components/sections/UpsellComposerSection";

const AIRecsPage = () => {
  const { t } = useTranslation();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(aiSuggestions);

  const handleApprove = (key: string) =>
    setSuggestions((prev) =>
      prev.map((s) => (s.key === key ? { ...s, status: "approved" } : s)),
    );

  const handleDismiss = (key: string) =>
    setSuggestions((prev) =>
      prev.map((s) => (s.key === key ? { ...s, status: "dismissed" } : s)),
    );

  const handleApproveAll = () =>
    setSuggestions((prev) =>
      prev.map((s) =>
        s.status === "pending" ? { ...s, status: "approved" } : s,
      ),
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#171A21]">
              {t("dashboard.aiRecs.title")}
            </h1>
            <p className="mt-1 text-sm text-[#8D95A5]">
              {t("dashboard.aiRecs.subtitle")}
            </p>
          </div>
        </div>
        <Button className="flex items-center gap-2 bg-primary text-white shadow hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          {t("dashboard.aiRecs.newCampaign")}
        </Button>
      </div>

      {/* Stats */}
      <AIRecsStatsSection stats={aiStats} />

      {/* Main content */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[450px_1fr]">
        <ActionableInsightsSection
          suggestions={suggestions}
          onApprove={handleApprove}
          onDismiss={handleDismiss}
          onApproveAll={handleApproveAll}
        />
        <UpsellComposerSection initialCampaign={defaultCampaign} />
      </div>
    </div>
  );
};

export default AIRecsPage;
