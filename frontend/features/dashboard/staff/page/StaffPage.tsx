"use client";

import { useMemo, useState } from "react";

import StaffDetailSection from "../components/sections/StaffDetailSection";
import StaffListSection from "../components/sections/StaffListSection";
import { staffMembers, staffSummaryMetrics } from "../data/data";
import type { StaffStatus } from "../types/staff.types";

const StaffPage = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | StaffStatus>("All");
  const [selectedMemberKey, setSelectedMemberKey] = useState(
    staffMembers[0]?.key ?? "",
  );

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return staffMembers.filter((member) => {
      const matchesStatus =
        statusFilter === "All" || member.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.role.toLowerCase().includes(normalizedQuery) ||
        member.station.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  const selectedMember =
    filteredMembers.find((member) => member.key === selectedMemberKey) ??
    filteredMembers[0] ??
    staffMembers[0];

  return (
    <section className="overflow-hidden rounded-xl border border-[#DEE1E7] bg-white shadow-[0px_1px_2px_0px_#0000000a]">
      <div className="border-b border-[#EEF1F5] px-4 py-3 sm:px-5">
        <h1 className="text-lg font-semibold text-[#171A21]">
          Staff Management
        </h1>
        <p className="text-xs text-[#8D95A5]">
          Manage schedules, performance, and team development.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {staffSummaryMetrics.map((metric) => (
            <div
              key={metric.key}
              className="rounded-md border border-[#E7EBF2] bg-[#F8FAFC] px-2.5 py-2"
            >
              <p className="text-[11px] text-[#8D95A5]">{metric.label}</p>
              <p className="text-sm font-semibold text-[#171A21]">
                {metric.value}
              </p>
              <p className="text-[10px] text-[#8D95A5]">{metric.hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]">
        <StaffListSection
          members={filteredMembers}
          selectedMemberKey={selectedMember?.key ?? ""}
          onSelectMember={setSelectedMemberKey}
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {selectedMember ? (
          <StaffDetailSection member={selectedMember} />
        ) : (
          <section className="rounded-xl border border-dashed border-[#DEE1E7] bg-white p-8 text-center text-sm text-[#8D95A5]">
            No staff matched your search/filter.
          </section>
        )}
      </div>
    </section>
  );
};

export default StaffPage;
