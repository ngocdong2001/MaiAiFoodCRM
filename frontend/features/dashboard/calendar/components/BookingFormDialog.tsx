"use client";

import { AlertCircle } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { AxiosError } from "axios";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/shared/components/ui/button";
import SelectField from "@/shared/components/molecules/SelectField";
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
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { Textarea } from "@/shared/components/ui/textarea";

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

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          requestClose();
        } else {
          onOpenChange(true);
        }
      }}
    >
      <DialogContent className="flex h-[min(92vh,50rem)] max-h-[92vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="shrink-0 border-b border-[#E7EAF0] px-6 py-5">
          <DialogTitle>
            {t(
              isEditing
                ? "dashboard.calendar.booking.editTitle"
                : "dashboard.calendar.booking.title",
            )}
          </DialogTitle>
          <DialogDescription>
            {t(
              isEditing
                ? "dashboard.calendar.booking.editDescription"
                : "dashboard.calendar.booking.description",
            )}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="mx-6 mt-4 flex shrink-0 items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <ScrollArea className="min-h-0 flex-1 px-6">
          <form id="booking-form" onSubmit={submit} className="space-y-5 py-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("dashboard.calendar.booking.guest")} required>
                {isWalkIn ? (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <Input
                        placeholder={t("dashboard.calendar.booking.walkInName")}
                        value={walkInName}
                        onChange={(e) => {
                          setWalkInName(e.target.value);
                          setError(null);
                        }}
                        className="h-9 flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsWalkIn(false);
                          setWalkInName("");
                          setWalkInPhone("");
                        }}
                        disabled={isEditing}
                        className="h-9 rounded-md border border-[#DEE1E7] px-2.5 text-xs text-[#8D95A5] hover:bg-[#F3F4F7]"
                      >
                        {t("dashboard.calendar.booking.chooseExisting")}
                      </button>
                    </div>
                    <Input
                      placeholder={t("dashboard.calendar.booking.walkInPhone")}
                      value={walkInPhone}
                      onChange={(e) => setWalkInPhone(e.target.value)}
                      className="h-9"
                    />
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <div className="flex-1">
                      <SelectField
                        value={values.guestId}
                        onValueChange={(value) => update("guestId", value)}
                        options={(options.data?.guests ?? []).map((guest) => ({
                          value: String(guest.id),
                          label: guest.phone
                            ? `${guest.name} · ${guest.phone}`
                            : guest.name,
                        }))}
                        placeholder={t(
                          "dashboard.calendar.booking.selectGuest",
                        )}
                        ariaLabel={t("dashboard.calendar.booking.guest")}
                        className="h-9"
                      />
                    </div>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsWalkIn(true);
                          update("guestId", "");
                        }}
                        className="h-9 rounded-md border border-[#DEE1E7] bg-[#F9FAFB] px-2.5 text-xs font-medium text-[#8D95A5] hover:bg-[#F3F4F7] hover:text-[#171A21]"
                      >
                        {t("dashboard.calendar.booking.addWalkIn")}
                      </button>
                    )}
                  </div>
                )}
              </Field>
              <Field label={t("dashboard.calendar.booking.staff")} required>
                <SelectField
                  value={values.staffId}
                  onValueChange={(value) => update("staffId", value)}
                  options={(options.data?.staff ?? []).map((staff) => ({
                    value: String(staff.id),
                    label: `${staff.name} · ${staff.role}`,
                  }))}
                  placeholder={t("dashboard.calendar.booking.selectStaff")}
                  ariaLabel={t("dashboard.calendar.booking.staff")}
                  className="h-9"
                />
              </Field>
              <Field label={t("dashboard.calendar.booking.date")} required>
                <Input
                  type="date"
                  value={values.date}
                  onChange={(event) => update("date", event.target.value)}
                  required
                />
              </Field>
              <Field label={t("dashboard.calendar.booking.startTime")} required>
                <Input
                  type="time"
                  value={values.startTime}
                  onChange={(event) => update("startTime", event.target.value)}
                  required
                />
              </Field>
              <Field label={t("dashboard.calendar.booking.status")}>
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
                  className="h-9"
                />
              </Field>
              <Field label={t("dashboard.calendar.booking.priority")}>
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
                  className="h-9"
                />
              </Field>
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                {t("dashboard.calendar.booking.services")}{" "}
                <span className="text-destructive">*</span>
              </legend>
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
                            className={
                              checked
                                ? "relative cursor-pointer rounded-lg border border-primary bg-primary/5 p-3"
                                : "relative cursor-pointer rounded-lg border border-[#DEE1E7] p-3 hover:bg-[#F9FAFB]"
                            }
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
            </fieldset>

            <Field label={t("dashboard.calendar.booking.notes")}>
              <Textarea
                rows={3}
                value={values.notes}
                onChange={(event) => update("notes", event.target.value)}
                placeholder={t("dashboard.calendar.booking.notesPlaceholder")}
              />
            </Field>
            {options.isError && (
              <p className="text-sm text-destructive">
                {t("dashboard.calendar.booking.loadOptionsError")}
              </p>
            )}
          </form>
        </ScrollArea>
        <DialogFooter className="shrink-0 border-t border-[#E7EAF0] flex items-center gap-3 px-6 py-4">
          {isEditing && (
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
          )}
          <div className="ml-auto flex gap-3">
            <Button type="button" variant="outline" onClick={requestClose}>
              {t("dashboard.calendar.booking.cancel")}
            </Button>
            <Button
              type="submit"
              form="booking-form"
              disabled={isSaving || options.isPending || isCreatingGuest}
            >
              {isCreatingGuest
                ? t("dashboard.calendar.booking.creatingGuest")
                : isSaving
                  ? t(
                      isEditing
                        ? "dashboard.calendar.booking.updating"
                        : "dashboard.calendar.booking.creating",
                    )
                  : t(
                      isEditing
                        ? "dashboard.calendar.booking.update"
                        : "dashboard.calendar.booking.create",
                    )}
            </Button>
          </div>
        </DialogFooter>
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
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label>
      {label}
      {required && <span className="text-destructive"> *</span>}
    </Label>
    {children}
  </div>
);

export default BookingFormDialog;
