"use client";

import { Clock, WandSparkles } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";

import type { AISuggestion } from "../../types/ai-recs.types";

interface SuggestionCardProps {
  suggestion: AISuggestion;
  highlighted?: boolean;
  onApprove: (key: string) => void;
  onDismiss: (key: string) => void;
}

const SuggestionCard = ({
  suggestion,
  highlighted = false,
  onApprove,
  onDismiss,
}: SuggestionCardProps) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white shadow-sm ${
        highlighted ? "shadow-md" : ""
      }`}
    >
      {highlighted && (
        <div className="absolute left-0 top-0 h-full w-1 bg-[#F04CAC]" />
      )}
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <InitialsAvatar
              name={suggestion.clientName}
              className="h-10 w-10 text-sm"
            />
            <div>
              <p className="text-sm font-semibold text-[#171A21]">
                {suggestion.clientName}
              </p>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-[#8D95A5]" />
                <span className="text-xs text-[#8D95A5]">
                  {suggestion.trigger}
                </span>
              </div>
            </div>
          </div>
          <span className="rounded-full bg-[#FEF1F8] px-3 py-0.5 text-xs font-semibold text-[#7F0A4F]">
            {suggestion.matchScore}% Match
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <WandSparkles className="h-4 w-4 shrink-0 text-[#F04CAC]" />
          <span className="text-sm font-medium text-[#171A21]">
            {suggestion.recommendation}
          </span>
        </div>

        <p className="mt-2 text-xs leading-5 text-[#8D95A5]">
          {suggestion.reasoning}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-[#DEE1E7] pt-4">
          <span className="text-sm font-semibold text-[#171A21]">
            {suggestion.revenueImpact}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDismiss(suggestion.key)}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              className="bg-[#F04CAC] text-white hover:bg-[#d93d98]"
              onClick={() => onApprove(suggestion.key)}
            >
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ActionableInsightsSectionProps {
  suggestions: AISuggestion[];
  onApprove: (key: string) => void;
  onDismiss: (key: string) => void;
  onApproveAll: () => void;
}

const ActionableInsightsSection = ({
  suggestions,
  onApprove,
  onDismiss,
  onApproveAll,
}: ActionableInsightsSectionProps) => {
  const pending = suggestions.filter((s) => s.status === "pending");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#171A21]">
          Actionable Insights
        </h2>
        <button
          onClick={onApproveAll}
          className="text-sm font-medium text-[#F04CAC] hover:underline"
        >
          Approve All
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {pending.map((suggestion, idx) => (
          <SuggestionCard
            key={suggestion.key}
            suggestion={suggestion}
            highlighted={idx === 0}
            onApprove={onApprove}
            onDismiss={onDismiss}
          />
        ))}
        {pending.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center text-sm text-[#8D95A5] shadow-sm">
            No pending suggestions.
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionableInsightsSection;
