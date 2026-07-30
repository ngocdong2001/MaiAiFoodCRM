"use client";

import React, { useState } from "react";
import { ArrowRight, Send, Sparkles } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import {
  Message,
  MessageContent,
  MessageGroup,
} from "@/shared/components/ui/message";
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/shared/components/ui/message-scroller";
import EditableComboBox from "@/shared/components/molecules/EditableComboBox";
import EditableTextField from "@/shared/components/molecules/EditableTextField";

import type {
  Campaign,
  MessageChannel,
  TriggerType,
} from "../../types/ai-recs.types";

const TRIGGERS: TriggerType[] = [
  "Upcoming Appointment",
  "Abandoned Cart",
  "Long Absence",
  "Birthday",
  "Custom",
];

const CHANNELS: MessageChannel[] = ["SMS", "Push", "Email"];

const MAX_CHARS = 160;

const PhonePreview = ({
  message,
  clientName = "Emma",
}: {
  message: string;
  clientName?: string;
}) => {
  const preview = message.replace("{ClientName}", clientName);

  return (
    <div className="flex flex-col items-center gap-4">
      <span className="rounded-full border border-[#DEE1E7] bg-[#F9FAFB] px-3 py-0.5 text-xs font-semibold text-[#171A21]">
        Live Preview
      </span>
      <p className="text-center text-base font-semibold text-[#171A21]">
        Interactive Push/SMS
      </p>
      <p className="text-center text-xs text-[#8D95A5]">
        This is how the client will see and interact with your upsell offer.
      </p>

      {/* Phone mockup */}
      <div className="relative flex h-145 w-70 flex-col overflow-hidden rounded-[48px] bg-[#F9FAFB] shadow-2xl ring-12 ring-[#F3F4F7]">
        {/* Notch */}
        <div className="absolute left-1/2 top-3 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#F3F4F7]" />

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#DEE1E7] px-4 pb-3 pt-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <span className="text-xs font-bold text-white">M</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#171A21]">MaiAI Salon</p>
            <p className="text-[10px] text-[#8D95A5]">Bot</p>
          </div>
        </div>

        {/* Chat area using MessageScroller */}
        <MessageScrollerProvider>
          <MessageScroller className="flex-1">
            <MessageScrollerViewport className="px-4 py-4">
              <MessageScrollerContent>
                <MessageScrollerItem>
                  <p className="mb-2 text-center text-xs text-[#8D95A5]">
                    Today 9:41 AM
                  </p>
                  <div className="mb-2 flex justify-center">
                    <span className="rounded-full bg-[#F3F4F7] px-3 py-0.5 text-[10px] uppercase text-[#8D95A5]">
                      Automated Upsell triggered
                    </span>
                  </div>
                </MessageScrollerItem>

                <MessageScrollerItem scrollAnchor>
                  <MessageGroup>
                    <Message align="start">
                      <MessageContent>
                        <div className="rounded-tl-sm rounded-br-2xl rounded-tr-2xl rounded-bl-2xl border border-[#DEE1E7] bg-[#F3F4F7] p-3 shadow-sm">
                          <p className="text-sm leading-5 text-[#171A21]">
                            {preview}
                          </p>
                          <div className="mt-3 flex flex-col gap-2">
                            <button className="w-full rounded-full bg-primary py-2 text-xs font-medium text-white">
                              Yes, add for $45
                            </button>
                            <button className="w-full rounded-full border border-[#DEE1E7] bg-[#F9FAFB] py-2 text-xs font-medium text-[#171A21]">
                              No thanks
                            </button>
                          </div>
                        </div>
                      </MessageContent>
                    </Message>
                  </MessageGroup>
                </MessageScrollerItem>
              </MessageScrollerContent>
            </MessageScrollerViewport>
          </MessageScroller>
        </MessageScrollerProvider>

        {/* Input bar */}
        <div className="flex items-center gap-2 border-t border-[#DEE1E7] bg-[#F3F4F7] px-4 py-3">
          <div className="flex-1 rounded-full border border-[#DEE1E7] bg-[#F9FAFB] px-4 py-2">
            <span className="text-xs text-[#8D95A5]">Type a message...</span>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <Send className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

interface UpsellComposerSectionProps {
  initialCampaign: Campaign;
}

const UpsellComposerSection = ({
  initialCampaign,
}: UpsellComposerSectionProps) => {
  const [campaign, setCampaign] = useState<Campaign>(initialCampaign);

  const charCount = campaign.messageContent.length;

  const update = <K extends keyof Campaign>(key: K, value: Campaign[K]) =>
    setCampaign((prev) => ({ ...prev, [key]: value }));

  const insertVar = (variable: string) =>
    update("messageContent", campaign.messageContent + `{${variable}}`);

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      {/* Top: 2 panels side by side */}
      <div className="grid grid-cols-1 divide-y divide-[#DEE1E7] lg:grid-cols-[1fr_auto] lg:items-stretch lg:divide-x lg:divide-y-0">
        {/* Left: Composer */}
        <div className="flex flex-col p-8 h-full">
          <div className="mb-1 flex items-center">
            <h2 className="text-lg font-semibold text-[#171A21]">
              Upsell Composer
            </h2>
          </div>
          <p className="mb-6 text-sm text-[#8D95A5]">
            Customize the automated message
          </p>

          {/* Campaign Name */}
          <EditableTextField
            label="Campaign Name"
            value={campaign.name}
            onChange={(e) =>
              update(
                "name",
                (e as React.ChangeEvent<HTMLInputElement>).target.value,
              )
            }
            className="mb-5"
          />

          {/* Trigger + Channel */}
          <div className="mb-5 flex gap-2">
            <EditableComboBox
              value={campaign.trigger}
              onValueChange={(v) => update("trigger", v as TriggerType)}
              placeholder="Select trigger"
              aria-label="Target Trigger"
              options={TRIGGERS.map((t) => ({ value: t, label: t }))}
            />
            <EditableComboBox
              value={campaign.channel}
              onValueChange={(v) => update("channel", v as MessageChannel)}
              placeholder="Select channel"
              aria-label="Channel"
              options={CHANNELS.map((c) => ({ value: c, label: c }))}
            />
          </div>

          {/* Message Content */}
          <div className="mb-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-[#171A21]">
                Message Content
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => insertVar("ClientName")}
                  className="rounded-xl border border-[#DEE1E7] bg-[#F3F4F7] px-2 py-1 text-[10px] font-medium text-[#171A21] hover:bg-[#DEE1E7]"
                >
                  + &#123;ClientName&#125;
                </button>
                <button
                  onClick={() => insertVar("ServiceName")}
                  className="rounded-xl border border-[#DEE1E7] bg-[#F3F4F7] px-2 py-1 text-[10px] font-medium text-[#171A21] hover:bg-[#DEE1E7]"
                >
                  + &#123;ServiceName&#125;
                </button>
              </div>
            </div>
            <EditableTextField
              multiline
              value={campaign.messageContent}
              onChange={(e) =>
                update(
                  "messageContent",
                  (e as React.ChangeEvent<HTMLTextAreaElement>).target.value,
                )
              }
              rows={6}
            />
          </div>

          {/* Char count */}
          <div className="mb-5 flex justify-end">
            <span className="text-xs text-[#8D95A5]">
              {charCount} / {MAX_CHARS} characters (1 SMS segment)
            </span>
          </div>

          {/* AI Auto-Optimization toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[#DEE1E7] bg-[#F3F4F7] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#A17DE8]/10">
                <Sparkles className="h-4 w-4 text-[#A17DE8]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#171A21]">
                  AI Auto-Optimization
                </p>
                <p className="text-xs text-[#8D95A5]">
                  Adjust send time based on client habits
                </p>
              </div>
            </div>
            <button
              onClick={() => update("aiAutoOptimize", !campaign.aiAutoOptimize)}
              className={`relative h-6 w-10 rounded-full transition-colors ${
                campaign.aiAutoOptimize ? "bg-primary" : "bg-[#DEE1E7]"
              }`}
            >
              <div
                className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  campaign.aiAutoOptimize ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Actions — tận đáy cột trái */}
          <div className="mt-auto flex items-center gap-3 border-t border-[#DEE1E7] pt-5">
            <button className="text-sm font-medium text-[#8D95A5] hover:text-red-500">
              Delete Draft
            </button>
            <Button variant="outline" className="ml-auto">
              Save as Draft
            </Button>
            <Button className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90">
              Activate Campaign
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex min-h-full items-center justify-center bg-[#FEF1F8]/30 p-8 lg:w-105">
          <PhonePreview message={campaign.messageContent} />
        </div>
      </div>
    </div>
  );
};

export default UpsellComposerSection;
