"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

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
import { useUpdateAppointmentStatus } from "@/features/dashboard/calendar/hooks/useCalendar";

// The Overview live-queue exposes the booking status flow. Other backend
// statuses (no_show, in_progress) are managed from the calendar and render as
// a plain read-only label here.
type BookingUiStatus = "pending" | "confirmed" | "completed" | "cancelled";

const STATUS_OPTIONS: { value: BookingUiStatus; badgeClass: string }[] = [
  { value: "pending", badgeClass: "bg-[#F97316] text-white" },
  { value: "confirmed", badgeClass: "bg-primary text-white" },
  { value: "completed", badgeClass: "bg-[#10B981] text-white" },
  { value: "cancelled", badgeClass: "bg-[#EF4444] text-white" },
];

const labelKey: Record<BookingUiStatus, string> = {
  pending: "dashboard.overview.queue.status.waiting",
  confirmed: "dashboard.overview.queue.status.ready",
  completed: "dashboard.overview.queue.status.completed",
  cancelled: "dashboard.overview.queue.status.cancelled",
};

const isUiStatus = (value: string): value is BookingUiStatus =>
  value === "pending" ||
  value === "confirmed" ||
  value === "completed" ||
  value === "cancelled";

type QueueStatusCellProps = {
  appointmentId: number;
  status: string;
};

const QueueStatusCell = ({ appointmentId, status }: QueueStatusCellProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { mutate, isPending } = useUpdateAppointmentStatus();
  const [error, setError] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<BookingUiStatus | null>(
    null,
  );

  if (!isUiStatus(status)) {
    return (
      <span className="inline-flex items-center rounded-full bg-[#EEF0F3] px-3 py-0.5 text-xs font-semibold text-[#8D95A5]">
        {status}
      </span>
    );
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
      {
        onSuccess: () =>
          queryClient.invalidateQueries({ queryKey: ["overview", "stats"] }),
        onError: () => setError(true),
      },
    );
    setPendingStatus(null);
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        {!isCompleted && (
          <SelectField
            value={status}
            onValueChange={requestChange}
            options={STATUS_OPTIONS.map((option) => ({
              value: option.value,
              label: t(labelKey[option.value]),
            }))}
            ariaLabel={t("dashboard.overview.queue.col.status")}
            size="sm"
            className="h-8 w-32"
            disabled={isPending}
          />
        )}
        {current && (
          <Badge className={cn("shrink-0", current.badgeClass)}>
            {t(labelKey[current.value])}
          </Badge>
        )}
      </div>
      {error && (
        <p className="text-[11px] text-destructive">
          {t("dashboard.overview.queue.status.error")}
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

export default QueueStatusCell;
