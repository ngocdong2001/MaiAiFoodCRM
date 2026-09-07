"use client";

import { useState, type FormEvent } from "react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/shared/components/ui/button";
import SelectField from "@/shared/components/molecules/SelectField";
import FormDialog from "@/shared/components/molecules/FormDialog";
import FormField from "@/shared/components/molecules/FormField";
import FormSection from "@/shared/components/molecules/FormSection";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

import { useCalendarData } from "../context/CalendarDataContext";
import {
  useCalendarOptions,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from "../hooks/useCalendar";
import { calendarService } from "../services/calendar.service";
import type { ApiAppointment } from "../types/calendar.types";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };
type Values = {
  guestId: string;
  staffId: string;
  date: string;
  startTime: string;
  serviceIds: number[];
  status: string;
  priority: string;
  notes: string;
};

const errorKey = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (message === "Staff already has an appointment in this time range")
      return "conflict";
    if (message === "Appointment is outside staff working hours")
      return "outsideHours";
    if (
      message === "Appointment overlaps the staff break" ||
      message?.startsWith("Appointment overlaps the staff break")
    )
      return "breakOverlap";
    if (message === "Staff is off on the selected date") return "dayOff";
    if (message === "Store is closed on the selected day") return "storeClosed";
    if (message === "Appointment is outside store operating hours")
      return "outsideStoreHours";
  }
  return "unknown";
};

const createInitialValues = (initialDate: Date): Values => ({
  guestId: "",
  staffId: "",
  date: initialDate.toISOString().slice(0, 10),
  startTime: "09:00",
  serviceIds: [],
  status: "confirmed",
  priority: "normal",
  notes: "",
});

const createValuesFromAppointment = (appointment: ApiAppointment): Values => {
  const startTime = new Date(appointment.startTime);
  const pad2 = (value: number) => String(value).padStart(2, "0");

  return {
    guestId: String(appointment.guestId),
    staffId: String(appointment.staffId),
    date: `${startTime.getFullYear()}-${pad2(startTime.getMonth() + 1)}-${pad2(startTime.getDate())}`,
    startTime: `${pad2(startTime.getHours())}:${pad2(startTime.getMinutes())}`,
    serviceIds: appointment.services.map((service) => service.id),
    status: appointment.status,
    priority: appointment.priority,
    notes: appointment.notes ?? "",
  };
};

const BookingFormDialog = ({ open, onOpenChange }: Props) => {
  const { cursorDate, setCursorDate } = useCalendarData();
  if (!open) return null;
  return (
    <BookingFormContent
      key={cursorDate.toISOString()}
      open={open}
      onOpenChange={onOpenChange}
      initialDate={cursorDate}
      onCreated={setCursorDate}
    />
  );
};

export const BookingFormContent = ({
  open,
  onOpenChange,
  initialDate,
  onCreated,
  defaultWalkIn = false,
  appointment,
}: Props & {
  initialDate: Date;
  onCreated: (date: Date) => void;
  defaultWalkIn?: boolean;
  appointment?: ApiAppointment;
}) => {
  const options = useCalendarOptions();
  const create = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const isEditing = Boolean(appointment);
  const [error, setError] = useState<string | null>(null);
  const [isWalkIn, setIsWalkIn] = useState(defaultWalkIn && !appointment);
  const [walkInName, setWalkInName] = useState("");
  const [walkInPhone, setWalkInPhone] = useState("");
  const [isCreatingGuest, setIsCreatingGuest] = useState(false);
  const [values, setValues] = useState<Values>(() =>
    appointment
      ? createValuesFromAppointment(appointment)
      : createInitialValues(initialDate),
  );

  const update = <Key extends keyof Values>(key: Key, value: Values[Key]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setError(null);
  };

  const resetForm = () => {
    setValues(
      appointment
        ? createValuesFromAppointment(appointment)
        : createInitialValues(initialDate),
    );
    setIsWalkIn(defaultWalkIn && !appointment);
    setWalkInName("");
    setWalkInPhone("");
    setError(null);
  };

  const requestClose = () => {
    resetForm();
    onOpenChange(false);
  };
  const selectedServices = (options.data?.services ?? []).filter((service) =>
    values.serviceIds.includes(service.id),
  );
  const durationMinutes = selectedServices.reduce(
    (total, service) => total + service.durationMinutes,
    0,
  );
  const totalPrice = selectedServices.reduce(
    (total, service) => total + service.price,
    0,
  );

  // Group services by category so the list reads as labelled subgroups.
  const groupedServices = (options.data?.services ?? []).reduce<
    Array<{
      category: string;
      services: Array<{
        id: number;
        name: string;
        price: number;
        durationMinutes: number;
      }>;
    }>
  >((groups, service) => {
    const label = service.category ?? "";
    const existing = groups.find((group) => group.category === label);
    if (existing) {
      existing.services.push(service);
    } else {
      groups.push({ category: label, services: [service] });
    }
    return groups;
  }, []);

  const handleDelete = () => {
    if (!appointment) return;

    const confirmDelete = window.confirm(
      t("dashboard.calendar.booking.deleteConfirmation"),
    );
    if (!confirmDelete) return;

    setError(null);
    deleteAppointment.mutate(appointment.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
      onError: () => {
        setError(t("dashboard.calendar.booking.errors.deleteFailed"));
      },
    });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    let resolvedGuestId = values.guestId;
    let createdGuestId: number | null = null;

    if (isWalkIn) {
      if (!walkInName.trim())
        return setError(
          t("dashboard.calendar.booking.errors.walkInNameRequired"),
        );
      setIsCreatingGuest(true);
      try {
        const newGuest = await calendarService.createQuickGuest(
          walkInName.trim(),
          walkInPhone.trim() || undefined,
        );
        resolvedGuestId = String(newGuest.id);
        if (newGuest.created) createdGuestId = newGuest.id;
        // Refresh options so the new guest appears in future dropdowns
        void queryClient.invalidateQueries({
          queryKey: ["calendar", "options"],
        });
      } catch {
        setIsCreatingGuest(false);
        return setError(
          t("dashboard.calendar.booking.errors.createGuestFailed"),
        );
      }
      setIsCreatingGuest(false);
    }

    if (!resolvedGuestId || !values.staffId || values.serviceIds.length === 0)
      return setError(t("dashboard.calendar.booking.errors.required"));
    const startDate = new Date(`${values.date}T${values.startTime}:00`);
    if (Number.isNaN(startDate.getTime()))
      return setError(t("dashboard.calendar.booking.errors.invalidDate"));
    const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);
    // Send as local time (no UTC conversion) so backend schedule comparison is timezone-safe
    const pad2 = (n: number) => String(n).padStart(2, "0");
    const fmtLocal = (d: Date) =>
      `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
    const input = {
      guestId: Number(resolvedGuestId),
      staffId: Number(values.staffId),
      startTime: fmtLocal(startDate),
      endTime: fmtLocal(endDate),
      serviceIds: values.serviceIds,
      status: values.status,
      priority: values.priority,
      source: isWalkIn ? "walk_in" : (appointment?.source ?? "dashboard"),
      notes: values.notes.trim() || undefined,
    };
    const onSuccess = () => {
      onCreated(startDate);
      onOpenChange(false);
    };
    const onError = (mutationError: unknown) => {
      // Roll back the just-created walk-in guest so a failed booking doesn't
      // leave an orphaned guest record behind.
      if (createdGuestId) void calendarService.deleteGuest(createdGuestId);
      setError(
        t(`dashboard.calendar.booking.errors.${errorKey(mutationError)}`),
      );
    };

    if (appointment) {
      updateAppointment.mutate(
        { id: appointment.id, input },
        { onSuccess, onError },
      );
      return;
    }

    create.mutate(input, {
      onSuccess,
      onError,
    });
  };

  const isSaving = create.isPending || updateAppointment.isPending;
  const isSubmitting = isSaving || isCreatingGuest;
  const submitLabel = isEditing
    ? t("dashboard.calendar.booking.update")
    : t("dashboard.calendar.booking.create");
  const submittingLabel = isCreatingGuest
    ? t("dashboard.calendar.booking.creatingGuest")
    : t(
        isEditing
          ? "dashboard.calendar.booking.updating"
          : "dashboard.calendar.booking.creating",
      );

  return (
    <FormDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          requestClose();
        } else {
          onOpenChange(true);
        }
      }}
      title={t(
        isEditing
          ? "dashboard.calendar.booking.editTitle"
          : "dashboard.calendar.booking.title",
      )}
      description={t(
        isEditing
          ? "dashboard.calendar.booking.editDescription"
          : "dashboard.calendar.booking.description",
      )}
      error={error}
      submitLabel={submitLabel}
      submittingLabel={submittingLabel}
      cancelLabel={t("dashboard.calendar.booking.cancel")}
      submitting={isSubmitting}
      submitDisabled={options.isPending}
      onSubmit={submit}
      footerActions={
        isEditing ? (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteAppointment.isPending || isSaving}
          >
            {deleteAppointment.isPending
              ? t("dashboard.calendar.booking.deleting")
              : t("dashboard.calendar.booking.delete")}
          </Button>
        ) : null
      }
      contentClassName="sm:max-w-2xl"
    >
      <FormSection title={t("dashboard.calendar.booking.detailsSection")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            {!isEditing && (
              <div className="mb-4 flex rounded-lg border border-[#DEE1E7] p-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsWalkIn(false);
                    setWalkInName("");
                    setWalkInPhone("");
                  }}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    !isWalkIn
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-[#F3F4F7]",
                  )}
                >
                  {t("dashboard.calendar.booking.guestTypeExisting")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsWalkIn(true);
                    update("guestId", "");
                  }}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isWalkIn
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-[#F3F4F7]",
                  )}
                >
                  {t("dashboard.calendar.booking.guestTypeWalkIn")}
                </button>
              </div>
            )}

            {isWalkIn ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label={t("dashboard.calendar.booking.walkInName")}
                  required
                >
                  <Input
                    value={walkInName}
                    onChange={(e) => {
                      setWalkInName(e.target.value);
                      setError(null);
                    }}
                    autoFocus
                  />
                </FormField>
                <FormField label={t("dashboard.calendar.booking.walkInPhone")}>
                  <Input
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                  />
                </FormField>
              </div>
            ) : (
              <FormField label={t("dashboard.calendar.booking.guest")} required>
                <SelectField
                  value={values.guestId}
                  onValueChange={(value) => update("guestId", value)}
                  options={(options.data?.guests ?? []).map((guest) => ({
                    value: String(guest.id),
                    label: guest.phone
                      ? `${guest.name} · ${guest.phone}`
                      : guest.name,
                  }))}
                  placeholder={t("dashboard.calendar.booking.selectGuest")}
                  ariaLabel={t("dashboard.calendar.booking.guest")}
                />
              </FormField>
            )}
          </div>

          <FormField label={t("dashboard.calendar.booking.staff")} required>
            <SelectField
              value={values.staffId}
              onValueChange={(value) => update("staffId", value)}
              options={(options.data?.staff ?? []).map((staff) => ({
                value: String(staff.id),
                label: `${staff.name} · ${staff.role}`,
              }))}
              placeholder={t("dashboard.calendar.booking.selectStaff")}
              ariaLabel={t("dashboard.calendar.booking.staff")}
            />
          </FormField>

          <FormField label={t("dashboard.calendar.booking.date")} required>
            <Input
              type="date"
              value={values.date}
              onChange={(event) => update("date", event.target.value)}
              required
            />
          </FormField>
          <FormField label={t("dashboard.calendar.booking.startTime")} required>
            <Input
              type="time"
              value={values.startTime}
              onChange={(event) => update("startTime", event.target.value)}
              required
            />
          </FormField>
          <FormField label={t("dashboard.calendar.booking.status")}>
            <SelectField
              value={values.status}
              onValueChange={(value) => update("status", value)}
              options={[
                {
                  value: "pending",
                  label: t("dashboard.calendar.booking.pending"),
                },
                {
                  value: "confirmed",
                  label: t("dashboard.calendar.booking.confirmed"),
                },
              ]}
              ariaLabel={t("dashboard.calendar.booking.status")}
            />
          </FormField>
          <FormField label={t("dashboard.calendar.booking.priority")}>
            <SelectField
              value={values.priority}
              onValueChange={(value) => update("priority", value)}
              options={[
                {
                  value: "normal",
                  label: t("dashboard.calendar.booking.normal"),
                },
                {
                  value: "high",
                  label: t("dashboard.calendar.booking.high"),
                },
              ]}
              ariaLabel={t("dashboard.calendar.booking.priority")}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title={t("dashboard.calendar.booking.servicesSection")}
        description={`${t("dashboard.calendar.booking.services")} *`}
      >
        <div className="space-y-4">
          {groupedServices.map((group) => (
            <div key={group.category || "__uncategorised"}>
              {group.category ? (
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8D95A5]">
                  {group.category}
                </p>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-3">
                {group.services.map((service) => {
                  const checked = values.serviceIds.includes(service.id);
                  return (
                    <label
                      key={service.id}
                      className={cn(
                        "relative cursor-pointer rounded-lg border p-3",
                        checked
                          ? "border-primary bg-primary/5"
                          : "border-[#DEE1E7] hover:bg-[#F9FAFB]",
                      )}
                    >
                      <input
                        type="checkbox"
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        checked={checked}
                        aria-label={`${service.name} ${t(
                          "dashboard.calendar.booking.minutes",
                          { count: service.durationMinutes },
                        )} · $${service.price.toFixed(2)}`}
                        onChange={() =>
                          update(
                            "serviceIds",
                            checked
                              ? values.serviceIds.filter(
                                  (id) => id !== service.id,
                                )
                              : [...values.serviceIds, service.id],
                          )
                        }
                      />
                      <span className="pointer-events-none block text-sm font-semibold text-[#171A21]">
                        {service.name}
                      </span>
                      <span className="pointer-events-none mt-1 block text-xs text-[#8D95A5]">
                        {t("dashboard.calendar.booking.minutes", {
                          count: service.durationMinutes,
                        })}{" "}
                        · ${service.price.toFixed(2)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {selectedServices.length > 0 && (
          <p className="mt-2 text-sm font-medium text-[#4B5563]">
            {t("dashboard.calendar.booking.total", {
              duration: durationMinutes,
              price: totalPrice.toFixed(2),
            })}
          </p>
        )}
      </FormSection>

      <FormSection title={t("dashboard.calendar.booking.notesSection")}>
        <FormField label={t("dashboard.calendar.booking.notes")}>
          <Textarea
            rows={3}
            value={values.notes}
            onChange={(event) => update("notes", event.target.value)}
            placeholder={t("dashboard.calendar.booking.notesPlaceholder")}
          />
        </FormField>
        {options.isError && (
          <p className="text-sm text-destructive">
            {t("dashboard.calendar.booking.loadOptionsError")}
          </p>
        )}
      </FormSection>
    </FormDialog>
  );
};

export default BookingFormDialog;
