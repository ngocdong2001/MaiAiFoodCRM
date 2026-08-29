import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import EmptyState from "@/shared/components/molecules/EmptyState";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { cn } from "@/shared/lib/utils";

import type { GuestCard, GuestSegment } from "../../types/crm.types";

type CRMGuestsListSectionProps = {
  guests: GuestCard[];
  selectedGuestKey: string;
  onSelectGuest: (guestKey: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  segment: GuestSegment;
  segments: GuestSegment[];
  onSegmentChange: (value: GuestSegment) => void;
};

const segmentTone = {
  VIP: "bg-[#F2EEFF] text-[#6F58B5]",
  Loyal: "bg-[#ECF8F2] text-[#2D8B5B]",
  "At Risk": "bg-[#FFF3E8] text-[#B46A2D]",
};

const CRMGuestsListSection = ({
  guests,
  selectedGuestKey,
  onSelectGuest,
  query,
  onQueryChange,
  segment,
  segments,
  onSegmentChange,
}: CRMGuestsListSectionProps) => {
  const { t } = useTranslation();
  return (
    <section className="p-4 sm:p-5 xl:border-r xl:border-[#EEF1F5]">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-[#171A21]">{t("dashboard.crm.list.title")}</h2>
        <span className="text-xs font-medium text-[#8D95A5]">
          {t("dashboard.crm.list.guestsCount", { count: guests.length })}
        </span>
      </div>

      <label className="mt-3 flex items-center rounded-md border border-[#E7EBF2] bg-[#F8FAFC] px-2 py-1.5 text-xs text-[#8D95A5]">
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t("dashboard.crm.list.searchPlaceholder")}
          className="w-full border-none bg-transparent text-xs text-[#374357] outline-none placeholder:text-[#A4ADBC]"
        />
      </label>

      <div className="mt-2 flex flex-wrap gap-1">
        {segments.map((item) => {
          const active = item === segment;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSegmentChange(item)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
                active
                  ? "border-[#D7DDED] bg-[#EEF2F8] text-[#4F5D75]"
                  : "border-[#E7EBF2] bg-white text-[#8D95A5] hover:bg-[#F8FAFC]",
              )}
            >
              {item === "All" ? t("dashboard.crm.list.allGuests") : t(`dashboard.crm.segments.${item}`)}
            </button>
          );
        })}
      </div>

      <ScrollArea className="mt-4 h-[min(55vh,32rem)] pr-3 xl:h-[calc(100vh-19rem)] xl:min-h-96 xl:max-h-180">
        <ul className="space-y-1.5 pb-1">
          {guests.map((guest) => {
            const isActive = guest.key === selectedGuestKey;

            return (
              <li key={guest.key}>
                <button
                  type="button"
                  onClick={() => onSelectGuest(guest.key)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors",
                    isActive
                      ? "border-[#F7A9D5] bg-[#FFF5FB]"
                      : "border-transparent hover:bg-[#F9FAFB]",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <InitialsAvatar
                      name={guest.name}
                      className="h-9 w-9 border border-[#E8ECF3]"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#171A21]">
                        {guest.name}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1">
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            segmentTone[guest.segment],
                          )}
                        >
                          {t(`dashboard.crm.segments.${guest.segment}`)}
                        </span>
                        <span className="max-w-24 truncate rounded-full bg-[#F3F5F9] px-1.5 py-0.5 text-[10px] text-[#707B90]">
                          {guest.roleTag}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="max-w-20 truncate text-[10px] text-[#99A3B5]">
                      {guest.listMeta}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#C3C8D1]" />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </ScrollArea>

      {guests.length === 0 && (
        <EmptyState
          variant="dashed"
          className="mt-4"
          message={t("dashboard.crm.list.noResults")}
        />
      )}
    </section>
  );
};

export default CRMGuestsListSection;
