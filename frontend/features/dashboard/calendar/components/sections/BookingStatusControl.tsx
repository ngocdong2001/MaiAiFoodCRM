"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Badge } from "@/shared/components/ui/badge";
import SelectField from "@/shared/components/molecules/SelectField";
import { cn } from "@/shared/lib/utils";

import { useUpdateAppointmentStatus } from "../../hooks/useCalendar";

// The UI only exposes 3 booking states; other backend statuses (cancelled, no_show,
// in_progress) are managed elsewhere and are left untouched if encountered here.
export type BookingUiStatus = "pending" | "confirmed" | "completed";

const STATUS_OPTIONS: { value: BookingUiStatus; badgeClass: string }[] = [
  { value: "pending", badgeClass: "bg-[#F59E0B] text-white" },
  { value: "confirmed", badgeClass: "bg-primary text-white" },
  { value: "completed", badgeClass: "bg-[#10B981] text-white" },
];

const labelKey: Record<BookingUiStatus, string> = {
  pending: "dashboard.calendar.statusControl.waiting",
  confirmed: "dashboard.calendar.statusControl.ready",
  completed: "dashboard.calendar.statusControl.completed",
};

type BookingStatusControlProps = {
  appointmentId: number;
  status: string;
};

const BookingStatusControl = ({
  appointmentId,
  status,
}: BookingStatusControlProps) => {
  const { t } = useTranslation();
  const { mutate, isPending } = useUpdateAppointmentStatus();
  const [error, setError] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<BookingUiStatus | null>(
    null,
  );

  const isUiStatus = (value: string): value is BookingUiStatus =>
    value === "pending" || value === "confirmed" || value === "completed";

  if (!isUiStatus(status)) {
    // Statuses outside the 3-state flow (cancelled, no_show, in_progress) render read-only.
    return null;
  }

  const isCompleted = status === "completed";
  const current = STATUS_OPTIONS.find((option) => option.value === status);

  const requestChange = (next: string) => {
    if (!isUiStatus(next) || next === status || isPending || isCompleted)
      return;
    setError(false);
    setPendingStatus(next);
  };

  const confirmChange = () => {
    if (!pendingStatus) return;
    mutate(
      { id: appointmentId, status: pendingStatus },
      { onError: () => setError(true) },
    );
    setPendingStatus(null);
  };

  return (
    <div className="space-y-1.5 border-t border-[#EEF0F3] pt-3">
      <p className="text-xs font-semibold text-[#171A21]">
        {t("dashboard.calendar.statusControl.label")}
      </p>
      <div className="flex items-center gap-2">
        {!isCompleted && (
          <SelectField
            value={status}
            onValueChange={requestChange}
            options={STATUS_OPTIONS.map((option) => ({
              value: option.value,
              label: t(labelKey[option.value]),
            }))}
            ariaLabel={t("dashboard.calendar.statusControl.label")}
            size="sm"
            className="h-8 flex-1"
            disabled={isPending}
          />
        )}
        {current && (
          <Badge className={cn("shrink-0", current.badgeClass)}>
            {t(labelKey[current.value])}
          </Badge>
        )}
      </div>
      {isPending && (
        <p className="text-[11px] text-[#8D95A5]">
          {t("dashboard.calendar.statusControl.updating")}
        </p>
      )}
      {error && (
        <p className="text-[11px] text-destructive">
          {t("dashboard.calendar.statusControl.error")}
        </p>
      )}

      <AlertDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.calendar.statusControl.confirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus &&
                t("dashboard.calendar.statusControl.confirmDescription", {
                  status: t(labelKey[pendingStatus]),
                })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("dashboard.calendar.statusControl.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmChange}>
              {t("dashboard.calendar.statusControl.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingStatusControl;
