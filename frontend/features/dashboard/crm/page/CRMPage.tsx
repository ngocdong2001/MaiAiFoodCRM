"use client";

import { Megaphone, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";

import CRMGuestProfileSection from "../components/sections/CRMGuestProfileSection";
import CRMGuestsListSection from "../components/sections/CRMGuestsListSection";
import { crmActivities, crmGuests } from "../data/data";
import type { GuestSegment } from "../types/crm.types";

const segments: GuestSegment[] = ["All", "VIP", "Loyal", "At Risk"];

const CRMPage = () => {
  const { t } = useTranslation();
  const [segment, setSegment] = useState<GuestSegment>("All");
  const [query, setQuery] = useState("");
  const [selectedGuestKey, setSelectedGuestKey] = useState(
    crmGuests[0]?.key ?? "",
  );

  const filteredGuests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return crmGuests.filter((guest) => {
      const matchesSegment = segment === "All" || guest.segment === segment;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        guest.name.toLowerCase().includes(normalizedQuery) ||
        guest.email.toLowerCase().includes(normalizedQuery) ||
        guest.phone.toLowerCase().includes(normalizedQuery);

      return matchesSegment && matchesQuery;
    });
  }, [query, segment]);

  const selectedGuest =
    filteredGuests.find((guest) => guest.key === selectedGuestKey) ??
    filteredGuests[0] ??
    crmGuests[0];

  const selectedActivities = useMemo(
    () =>
      selectedGuest
        ? crmActivities.filter(
            (activity) => activity.guestKey === selectedGuest.key,
          )
        : [],
    [selectedGuest],
  );

  const totalGuests = filteredGuests.length;
  const vipGuests = filteredGuests.filter(
    (guest) => guest.segment === "VIP",
  ).length;
  const atRiskGuests = filteredGuests.filter(
    (guest) => guest.segment === "At Risk",
  ).length;

  return (
    <section className="overflow-hidden rounded-xl border border-[#DEE1E7] bg-white shadow-[0px_1px_2px_0px_#0000000a]">
      <div className="border-b border-[#EEF1F5] px-4 py-3 sm:px-5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-[#171A21]">
              {t("dashboard.crm.title")}
            </h1>
            <p className="text-xs text-[#8D95A5]">
              {t("dashboard.crm.subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-8 border-[#DEE1E7] bg-white text-[#374357]"
            >
              <Megaphone className="mr-1 h-3.5 w-3.5" />
              {t("dashboard.crm.createCampaign")}
            </Button>
            <Button variant="default" className="h-8">
              <UserPlus className="mr-1 h-3.5 w-3.5" />
              {t("dashboard.crm.addGuest")}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-md border border-[#E7EBF2] bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#566074]">
            {t("dashboard.crm.totalGuests", { count: totalGuests })}
          </span>
          <span className="rounded-md border border-[#E7EBF2] bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#566074]">
            {t("dashboard.crm.vip", { count: vipGuests })}
          </span>
          <span className="rounded-md border border-[#E7EBF2] bg-[#F8FAFC] px-2.5 py-1 text-xs font-medium text-[#566074]">
            {t("dashboard.crm.atRisk", { count: atRiskGuests })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
        <CRMGuestsListSection
          guests={filteredGuests}
          selectedGuestKey={selectedGuest?.key ?? ""}
          onSelectGuest={setSelectedGuestKey}
          query={query}
          onQueryChange={setQuery}
          segment={segment}
          segments={segments}
          onSegmentChange={setSegment}
        />

        {selectedGuest ? (
          <CRMGuestProfileSection
            guest={selectedGuest}
            activities={selectedActivities}
          />
        ) : (
          <section className="rounded-xl border border-dashed border-[#DEE1E7] bg-white p-8 text-center text-sm text-[#8D95A5]">
            {t("dashboard.crm.emptyState")}
          </section>
        )}
      </div>
    </section>
  );
};

export default CRMPage;
