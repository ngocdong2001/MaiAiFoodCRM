"use client";

import { useState, type FormEvent } from "react";

import SelectField from "@/shared/components/molecules/SelectField";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

import type {
  StaffFormValues,
  StaffMember,
  StaffSpecialty,
  StaffStatus,
  WeeklySchedule,
} from "../types/staff.types";
import { WeeklyScheduleSection } from "./WeeklyScheduleSection";

type StaffFormDialogProps = {
  open: boolean;
  member: StaffMember | null;
  specialties: StaffSpecialty[];
  selectedDate: string;
  submitting: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StaffFormValues) => void;
};

const emptyValues = (date: string): StaffFormValues => ({
  name: "",
  role: "",
  status: "active",
  phone: "",
  email: "",
  avatarUrl: "",
  hourlyRate: "",
  commissionRate: "",
  joinDate: new Date().toISOString().slice(0, 10),
  specialtyIds: [],
  weeklySchedule: {
    monday: { active: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00", station: null },
    tuesday: { active: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00", station: null },
    wednesday: { active: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00", station: null },
    thursday: { active: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00", station: null },
    friday: { active: true, startTime: "09:00", endTime: "17:00", breakStart: "12:00", breakEnd: "13:00", station: null },
    saturday: { active: false },
    sunday: { active: false },
  },
  scheduleDate: date,
  startTime: "09:00",
  endTime: "17:00",
  breakStart: "",
  breakEnd: "",
  isDayOff: false,
  station: "",
});

const memberValues = (member: StaffMember, date: string): StaffFormValues => {
  const schedule = member.schedules.find((item) => item.date === date);
  return {
    name: member.name,
    role: member.role,
    status: member.status,
    phone: member.phone ?? "",
    email: member.email ?? "",
    avatarUrl: member.avatarUrl ?? "",
    hourlyRate: member.hourlyRate?.toString() ?? "",
    commissionRate: member.commissionRate?.toString() ?? "",
    joinDate: member.joinDate ?? "",
    specialtyIds: member.specialties.map((specialty) => specialty.id),
    weeklySchedule: member.weeklySchedule,
    scheduleDate: date,
    startTime: schedule?.startTime ?? "09:00",
    endTime: schedule?.endTime ?? "17:00",
    breakStart: schedule?.breakStart ?? "",
    breakEnd: schedule?.breakEnd ?? "",
    isDayOff: schedule?.isDayOff ?? false,
    station: schedule?.note ?? "",
  };
};

const StaffFormDialog = (props: StaffFormDialogProps) => {
  if (!props.open) {
    return null;
  }

  return (
    <StaffFormContent
      key={`${props.member?.id ?? "new"}-${props.selectedDate}`}
      {...props}
    />
  );
};

const StaffFormContent = ({
  open,
  member,
  specialties,
  selectedDate,
  submitting,
  error,
  onOpenChange,
  onSubmit,
}: StaffFormDialogProps) => {
  const [values, setValues] = useState<StaffFormValues>(() =>
    member ? memberValues(member, selectedDate) : emptyValues(selectedDate),
  );

  const update = <Key extends keyof StaffFormValues>(
    key: Key,
    value: StaffFormValues[Key],
  ) => setValues((current) => ({ ...current, [key]: value }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{member ? "Edit staff" : "Add staff"}</DialogTitle>
          <DialogDescription>
            Manage profile, specialties, and working hours. Set a weekly schedule once, then override for specific dates as needed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input
                value={values.name}
                onChange={(event) => update("name", event.target.value)}
                required
              />
            </Field>
            <Field label="Role" required>
              <Input
                value={values.role}
                onChange={(event) => update("role", event.target.value)}
                required
              />
            </Field>
            <Field label="Status">
              <SelectField
                value={values.status}
                onValueChange={(value) =>
                  update("status", value as StaffStatus)
                }
                options={[
                  { value: "active", label: "Active" },
                  { value: "busy", label: "Busy" },
                  { value: "on_leave", label: "On Leave" },
                ]}
                ariaLabel="Status"
                className="h-9"
              />
            </Field>
            <Field label="Join date">
              <Input
                type="date"
                value={values.joinDate}
                onChange={(event) => update("joinDate", event.target.value)}
              />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                value={values.email}
                onChange={(event) => update("email", event.target.value)}
              />
            </Field>
            <Field label="Phone">
              <Input
                value={values.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </Field>
            <Field label="Hourly rate">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={values.hourlyRate}
                onChange={(event) => update("hourlyRate", event.target.value)}
              />
            </Field>
            <Field label="Commission rate (%)">
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={values.commissionRate}
                onChange={(event) =>
                  update("commissionRate", event.target.value)
                }
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Avatar URL">
                <Input
                  type="url"
                  value={values.avatarUrl}
                  onChange={(event) => update("avatarUrl", event.target.value)}
                />
              </Field>
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium">Specialties</legend>
            <div className="flex flex-wrap gap-2">
              {specialties.map((specialty) => {
                const checked = values.specialtyIds.includes(specialty.id);
                return (
                  <label
                    key={specialty.id}
                    className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${checked ? "border-primary bg-primary/10 text-primary" : "border-[#DEE1E7]"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        update(
                          "specialtyIds",
                          checked
                            ? values.specialtyIds.filter(
                                (id) => id !== specialty.id,
                              )
                            : [...values.specialtyIds, specialty.id],
                        )
                      }
                      className="sr-only"
                    />
                    {specialty.name}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="rounded-lg border border-[#DEE1E7] p-4">
            <legend className="px-1 text-sm font-semibold">Weekly Schedule Template</legend>
            <p className="mb-4 text-xs text-gray-600">
              Set your default working hours for each day of the week. This will be used for all appointments unless overridden.
            </p>
            <WeeklyScheduleSection
              weeklySchedule={values.weeklySchedule}
              onChange={(schedule) => update("weeklySchedule", schedule)}
            />
          </fieldset>

          <fieldset className="rounded-lg border border-[#DEE1E7] p-4">
            <legend className="px-1 text-sm font-semibold">Per-Date Override (Optional)</legend>
            <p className="mb-4 text-xs text-gray-600">
              Set a different schedule for a specific date (e.g., special shift, holiday). Leave empty to use weekly schedule.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date">
                <Input
                  type="date"
                  value={values.scheduleDate}
                  onChange={(event) =>
                    update("scheduleDate", event.target.value)
                  }
                />
              </Field>
              <Field label="Station">
                <Input
                  value={values.station}
                  onChange={(event) => update("station", event.target.value)}
                  placeholder="Station 1"
                />
              </Field>
              <Field label="Start time">
                <Input
                  type="time"
                  value={values.startTime}
                  onChange={(event) => update("startTime", event.target.value)}
                />
              </Field>
              <Field label="End time">
                <Input
                  type="time"
                  value={values.endTime}
                  onChange={(event) => update("endTime", event.target.value)}
                />
              </Field>
              <Field label="Break start">
                <Input
                  type="time"
                  value={values.breakStart}
                  onChange={(event) => update("breakStart", event.target.value)}
                />
              </Field>
              <Field label="Break end">
                <Input
                  type="time"
                  value={values.breakEnd}
                  onChange={(event) => update("breakEnd", event.target.value)}
                />
              </Field>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={values.isDayOff}
                onChange={(event) => update("isDayOff", event.target.checked)}
              />
              Mark as day off
            </label>
          </fieldset>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="mx-0 mb-0 px-0 pb-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save staff"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label>
      {label}
      {required ? " *" : ""}
    </Label>
    {children}
  </div>
);

export default StaffFormDialog;
