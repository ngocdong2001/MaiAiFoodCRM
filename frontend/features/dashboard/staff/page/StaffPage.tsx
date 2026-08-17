"use client";

import { useDeferredValue, useMemo, useState } from "react";

import SkeletonGrid from "@/shared/components/atoms/SkeletonGrid";
import ConfirmDialog from "@/shared/components/molecules/ConfirmDialog";
import QueryErrorState from "@/shared/components/molecules/QueryErrorState";
import { getApiErrorMessage } from "@/shared/lib/apiError";

import StaffFormDialog from "../components/StaffFormDialog";
import StaffGridSection from "../components/sections/StaffGridSection";
import StaffToolbarSection from "../components/sections/StaffToolbarSection";
import WeeklyScheduleSection from "../components/sections/WeeklyScheduleSection";
import { useAppointments } from "@/features/dashboard/calendar/hooks/useCalendar";
import {
  useCreateStaff,
  useDeleteStaff,
  useStaffList,
  useStaffSpecialties,
  useUpdateStaff,
} from "../hooks/useStaff";
import type {
  StaffFormValues,
  StaffMember,
  StaffStatus,
} from "../types/staff.types";

const getApiError = (error: unknown) =>
  getApiErrorMessage(error, "Unable to save staff");

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toDayQueryRange = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const start = new Date(year, month - 1, day, 0, 0, 0, 0);
  const end = new Date(year, month - 1, day, 23, 59, 59, 999);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
};

const StaffPage = () => {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | StaffStatus>("All");
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<StaffMember | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query.trim());
  const dayRange = useMemo(() => toDayQueryRange(selectedDate), [selectedDate]);

  const staffQuery = useStaffList({
    date: selectedDate,
    search: deferredQuery || undefined,
    status: statusFilter === "All" ? undefined : statusFilter,
  });
  const appointmentsQuery = useAppointments({
    startDate: dayRange.startDate,
    endDate: dayRange.endDate,
  });
  const specialtiesQuery = useStaffSpecialties();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const members = staffQuery.data ?? [];

  const openCreate = () => {
    setEditingMember(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditingMember(member);
    setFormError(null);
    setDialogOpen(true);
  };

  const submitStaff = async (values: StaffFormValues) => {
    setFormError(null);
    try {
      if (editingMember) {
        await updateStaff.mutateAsync({ id: editingMember.id, values });
      } else {
        await createStaff.mutateAsync(values);
      }
      setDialogOpen(false);
    } catch (error) {
      setFormError(getApiError(error));
    }
  };

  const confirmDelete = async () => {
    if (!deletingMember) return;
    try {
      await deleteStaff.mutateAsync(deletingMember.id);
      setDeletingMember(null);
    } catch (error) {
      setFormError(getApiError(error));
    }
  };

  const shiftSelectedDate = (days: number) => {
    setSelectedDate((current) => {
      const base = new Date(`${current}T00:00:00`);
      base.setDate(base.getDate() + days);
      return toDateKey(base);
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <StaffToolbarSection
        query={query}
        onQueryChange={setQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
        onAdd={openCreate}
      />

      {staffQuery.isPending ? (
        <SkeletonGrid
          count={4}
          className="sm:grid-cols-2 lg:grid-cols-4"
          itemClassName="h-64"
        />
      ) : staffQuery.isError ? (
        <QueryErrorState
          message="Could not load staff from the database."
          retryLabel="Try again"
          onRetry={() => staffQuery.refetch()}
        />
      ) : (
        <StaffGridSection
          members={members}
          onEdit={openEdit}
          onDelete={setDeletingMember}
        />
      )}

      <WeeklyScheduleSection
        members={members}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
        onPrevDate={() => shiftSelectedDate(-1)}
        onNextDate={() => shiftSelectedDate(1)}
        appointments={appointmentsQuery.data ?? []}
        isLoading={staffQuery.isFetching || appointmentsQuery.isFetching}
      />

      <StaffFormDialog
        open={dialogOpen}
        member={editingMember}
        specialties={specialtiesQuery.data ?? []}
        selectedDate={selectedDate}
        submitting={createStaff.isPending || updateStaff.isPending}
        error={formError}
        onOpenChange={setDialogOpen}
        onSubmit={submitStaff}
      />

      <ConfirmDialog
        open={Boolean(deletingMember)}
        title="Delete staff member?"
        description={`${deletingMember?.name ?? ""}'s profile, schedules, and specialty assignments will be removed permanently.`}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        pendingLabel="Deleting..."
        pending={deleteStaff.isPending}
        destructive
        onOpenChange={(open) => !open && setDeletingMember(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default StaffPage;
