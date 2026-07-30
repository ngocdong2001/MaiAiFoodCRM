"use client";

import { FileText } from "lucide-react";

import type { SavedTemplate } from "../../types/reports.types";

interface SavedTemplatesSectionProps {
  templates: SavedTemplate[];
}

const formatBadgeColor: Record<SavedTemplate["format"], string> = {
  PDF: "bg-[#F3F4F7] text-[#1E222A]",
  CSV: "bg-[#F3F4F7] text-[#1E222A]",
  Excel: "bg-[#F3F4F7] text-[#1E222A]",
};

const SavedTemplatesSection = ({ templates }: SavedTemplatesSectionProps) => {
  return (
    <div className="flex flex-col rounded-[14px] border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
      <div className="px-6 pt-6">
        <h3 className="text-base font-semibold text-[#171A21]">
          Saved Templates
        </h3>
        <p className="mt-1 text-sm text-[#8D95A5]">
          Run your frequently used reports.
        </p>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-[#DEE1E7]">
        {templates.map((template) => (
          <div
            key={template.key}
            className="flex items-center gap-3 px-6 py-4 hover:bg-[#F9FAFB]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#F3F4F7]">
              <FileText className="h-4 w-4 text-[#1E222A]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#171A21]">
                {template.name}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${formatBadgeColor[template.format]}`}
                >
                  {template.format}
                </span>
                <span className="text-xs text-[#8D95A5]">•</span>
                <span className="text-xs text-[#8D95A5]">
                  {template.frequency}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-[#DEE1E7] px-6 py-4">
        <button className="w-full text-center text-sm font-medium text-primary hover:opacity-80">
          Manage Templates
        </button>
      </div>
    </div>
  );
};

export default SavedTemplatesSection;
