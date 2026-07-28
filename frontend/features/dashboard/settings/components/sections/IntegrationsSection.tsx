"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";

import type { IntegrationItem } from "../../types/settings.types";

interface IntegrationsSectionProps {
  items: IntegrationItem[];
}

const categoryColors: Record<string, string> = {
  Calendar: "bg-[#A17DE8]/10 text-[#A17DE8]",
  Payments: "bg-[#37D278]/10 text-[#37D278]",
  Marketing: "bg-[#F04CAC]/10 text-[#F04CAC]",
  Accounting: "bg-[#3B9FF7]/10 text-[#3B9FF7]",
  Communications: "bg-[#F6AA28]/10 text-[#F6AA28]",
  Social: "bg-[#EB5656]/10 text-[#EB5656]",
};

const IntegrationsSection = ({ items }: IntegrationsSectionProps) => {
  const [integrations, setIntegrations] = useState(items);

  const toggle = (key: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, connected: !item.connected } : item,
      ),
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#171A21]">Integrations</h2>
      <p className="mt-1 text-sm text-[#8D95A5]">
        Connect your favorite tools to streamline your workflow.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {integrations.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between rounded-[14px] border border-[#DEE1E7] bg-white p-5 shadow-[0px_2px_4px_0px_#00000012]"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#171A21]">
                  {item.name}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[item.category] ?? "bg-[#F3F4F7] text-[#8D95A5]"}`}
                >
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-[#8D95A5]">{item.description}</p>
            </div>

            <button
              onClick={() => toggle(item.key)}
              className="ml-4 mt-0.5 shrink-0"
              title={item.connected ? "Disconnect" : "Connect"}
            >
              {item.connected ? (
                <CheckCircle2 className="h-5 w-5 text-[#37D278]" />
              ) : (
                <Circle className="h-5 w-5 text-[#DEE1E7]" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationsSection;
