"use client";

import { useMemo, useState } from "react";

import StaffGridSection from "../components/sections/StaffGridSection";
import StaffToolbarSection from "../components/sections/StaffToolbarSection";
import WeeklyScheduleSection from "../components/sections/WeeklyScheduleSection";
import { staffMembers } from "../data/data";
import type { StaffStatus } from "../types/staff.types";

const StaffPage = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | StaffStatus>("All");

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return staffMembers.filter((member) => {
      const matchesStatus =
        statusFilter === "All" || member.status === statusFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.role.toLowerCase().includes(normalizedQuery) ||
        (member.station?.toLowerCase().includes(normalizedQuery) ?? false);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter]);

  return (
    <div className="flex flex-col gap-6">
      <StaffToolbarSection
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <StaffGridSection members={filteredMembers} />

      <WeeklyScheduleSection
        members={staffMembers}
        weekLabel="Oct 12 - Oct 18, 2023"
      />
    </div>
  );
};

export default StaffPage;
