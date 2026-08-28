"use client";

import { useState, type FormEvent } from "react";

import FormDialog from "@/shared/components/molecules/FormDialog";
import FormField from "@/shared/components/molecules/FormField";
import FormSection from "@/shared/components/molecules/FormSection";
import SelectField from "@/shared/components/molecules/SelectField";
import { Input } from "@/shared/components/ui/input";

import type {
  StaffFormValues,
  StaffMember,
  StaffSpecialty,
  StaffStatus,
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
    monday: {
      active: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      station: null,
    },
    tuesday: {
      active: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      station: null,
    },
    wednesday: {
      active: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      station: null,
    },
    thursday: {
      active: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      station: null,
    },
    friday: {
      active: true,
      startTime: "09:00",
      endTime: "17:00",
      breakStart: "12:00",
      breakEnd: "13:00",
      station: null,
    },
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
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={member ? "Edit staff" : "Add staff"}
      description="Manage profile, specialties, and working hours. Set a weekly schedule once, then override for specific dates as needed."
      error={error}
      submitLabel={member ? "Save staff" : "Add staff"}
      cancelLabel="Cancel"
      submitting={submitting}
      onSubmit={handleSubmit}
      contentClassName="sm:max-w-2xl"
    >
      <FormSection
        title="Profile"
        description="Basic identity and compensation information."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full name" required>
            <Input
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              required
            />
          </FormField>
          <FormField label="Role" required>
            <Input
              value={values.role}
              onChange={(event) => update("role", event.target.value)}
              required
            />
          </FormField>
          <FormField label="Status">
            <SelectField
              value={values.status}
              onValueChange={(value) => update("status", value as StaffStatus)}
              options={[
                { value: "active", label: "Active" },
                { value: "busy", label: "Busy" },
                { value: "on_leave", label: "On Leave" },
              ]}
              ariaLabel="Status"
              className="h-9"
            />
          </FormField>
          <FormField label="Join date">
            <Input
              type="date"
              value={values.joinDate}
              onChange={(event) => update("joinDate", event.target.value)}
            />
          </FormField>
          <FormField label="Email">
            <Input
              type="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </FormField>
          <FormField label="Phone">
            <Input
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Compensation"
        description="How this staff member is paid."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Hourly rate">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={values.hourlyRate}
              onChange={(event) => update("hourlyRate", event.target.value)}
            />
          </FormField>
          <FormField label="Commission rate (%)">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={values.commissionRate}
              onChange={(event) => update("commissionRate", event.target.value)}
            />
          </FormField>
          <FormField label="Avatar URL" className="sm:col-span-2">
            <Input
              type="url"
              value={values.avatarUrl}
              onChange={(event) => update("avatarUrl", event.target.value)}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Specialties"
        description="Assign the services this staff member can perform."
      >
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
      </FormSection>

      <FormSection
        title="Weekly Schedule Template"
        description="Set your default working hours for each day of the week. This will be used for all appointments unless overridden."
      >
        <WeeklyScheduleSection
          weeklySchedule={values.weeklySchedule}
          onChange={(schedule) => update("weeklySchedule", schedule)}
        />
      </FormSection>

      <FormSection
        title="Per-Date Override (Optional)"
        description="Set a different schedule for a specific date (e.g., special shift, holiday). Leave empty to use weekly schedule."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Date">
            <Input
              type="date"
              value={values.scheduleDate}
              onChange={(event) => update("scheduleDate", event.target.value)}
            />
          </FormField>
          <FormField label="Station">
            <Input
              value={values.station}
              onChange={(event) => update("station", event.target.value)}
              placeholder="Station 1"
            />
          </FormField>
          <FormField label="Start time">
            <Input
              type="time"
              value={values.startTime}
              onChange={(event) => update("startTime", event.target.value)}
            />
          </FormField>
          <FormField label="End time">
            <Input
              type="time"
              value={values.endTime}
              onChange={(event) => update("endTime", event.target.value)}
            />
          </FormField>
          <FormField label="Break start">
            <Input
              type="time"
              value={values.breakStart}
              onChange={(event) => update("breakStart", event.target.value)}
            />
          </FormField>
          <FormField label="Break end">
            <Input
              type="time"
              value={values.breakEnd}
              onChange={(event) => update("breakEnd", event.target.value)}
            />
          </FormField>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={values.isDayOff}
            onChange={(event) => update("isDayOff", event.target.checked)}
          />
          Mark as day off
        </label>
      </FormSection>
    </FormDialog>
  );
};

export default StaffFormDialog;
