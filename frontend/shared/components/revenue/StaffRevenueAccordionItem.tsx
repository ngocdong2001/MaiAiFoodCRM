"use client";

import { MoreVertical, RotateCcw, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Separator } from "@/shared/components/ui/separator";
import {
  revenueService,
  type StaffRevenueDetailJob,
  type StaffRevenueDetailResponse,
  type StaffRevenueRow,
} from "@/features/dashboard/revenue/services/revenue.service";

const fmt = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ── Job detail dialog ──────────────────────────────────────────────────────────
interface JobDialogProps {
  job: StaffRevenueDetailJob;
  onClose: () => void;
}

function JobDetailDialog({ job, onClose }: JobDialogProps) {
  const { t } = useTranslation();
  const isCancelled = job.status === "cancelled";
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[12px] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3">
            {job.guestAvatarUrl ? (
              <img
                src={job.guestAvatarUrl}
                alt={job.guestName}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <InitialsAvatar
                name={job.guestName}
                className="h-12 w-12 text-sm"
              />
            )}
            <div>
              <DialogTitle className="text-lg font-bold text-[#1A1A1A]">
                {job.guestName}
              </DialogTitle>
              <p className="text-xs text-[#9DA1A7]">{fmtTime(job.paidAt)}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 pb-6 pt-4">
          {/* Cancel badge */}
          {isCancelled && (
            <div className="rounded-lg bg-orange-50 p-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-orange-500 text-white">
                  {t("dashboard.revenue.staffDetail.cancelled", {
                    defaultValue: "Cancelled",
                  })}
                </Badge>
                {job.cancelReasonStatus && (
                  <Badge
                    variant="outline"
                    className="border-orange-300 text-orange-600"
                  >
                    {job.cancelReasonStatus === "pending"
                      ? t("dashboard.revenue.staffDetail.reasonPending", {
                          defaultValue: "Reason Pending",
                        })
                      : t("dashboard.revenue.staffDetail.reasonReviewed", {
                          defaultValue: "Reason Reviewed",
                        })}
                  </Badge>
                )}
              </div>
              {job.cancelReason && (
                <p className="mt-2 text-sm text-orange-800">
                  {t("dashboard.revenue.staffDetail.reason", {
                    defaultValue: "Reason",
                  })}
                  : {job.cancelReason}
                </p>
              )}
            </div>
          )}

          {/* Services */}
          {job.services.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#9DA1A7]">
                {t("dashboard.revenue.staffDetail.services", {
                  defaultValue: "Services",
                })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {job.services.map((svc) => (
                  <Badge
                    key={svc.serviceId}
                    variant="secondary"
                    className="gap-1 text-xs"
                  >
                    <Tag className="h-3 w-3" />
                    {svc.serviceName} &mdash; {fmt(svc.price)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Financial breakdown */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[10px] bg-[#F6F7F9] p-3">
              <p className="text-xs text-[#9DA1A7]">
                {t("dashboard.revenue.staffDetail.amount", {
                  defaultValue: "Amount",
                })}
              </p>
              <p className="mt-0.5 text-base font-semibold text-[#1A1A1A]">
                {fmt(job.amount)}
              </p>
            </div>
            <div className="rounded-[10px] bg-[#F6F7F9] p-3">
              <p className="text-xs text-[#9DA1A7]">
                {t("dashboard.revenue.staffDetail.discount", {
                  defaultValue: "Discount",
                })}
              </p>
              <p className="mt-0.5 text-base font-semibold text-red-500">
                -{fmt(job.discountAmount)}
              </p>
            </div>
            <div className="rounded-[10px] bg-[#F6F7F9] p-3">
              <p className="text-xs text-[#9DA1A7]">
                {t("dashboard.revenue.table.tips")}
              </p>
              <p className="mt-0.5 text-base font-semibold text-[#10B981]">
                +{fmt(job.tipAmount)}
              </p>
            </div>
            <div className="rounded-[10px] bg-[#FFF3F8] p-3">
              <p className="text-xs text-[#9DA1A7]">
                {t("dashboard.revenue.staffDetail.final", {
                  defaultValue: "Final",
                })}
              </p>
              <p className="mt-0.5 text-base font-bold text-[#f04cac]">
                {fmt(job.finalAmount)}
              </p>
            </div>
          </div>

          {job.receiptNumber && (
            <p className="text-xs text-[#B0B5BF]">
              {t("dashboard.revenue.staffDetail.receipt", {
                defaultValue: "Receipt",
              })}
              : #{job.receiptNumber}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Main row (always expanded) ────────────────────────────────────────────────
interface Props {
  row: StaffRevenueRow;
  dateRange?: { startDate?: string; endDate?: string };
  onDataChanged?: () => void;
}

export function StaffRevenueAccordionItem({
  row,
  dateRange,
  onDataChanged,
}: Props) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<StaffRevenueDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<StaffRevenueDetailJob | null>(
    null,
  );
  const [reasonDialogJob, setReasonDialogJob] =
    useState<StaffRevenueDetailJob | null>(null);
  const [reasonText, setReasonText] = useState("");
  const [isSubmittingReason, setIsSubmittingReason] = useState(false);
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [restoringJob, setRestoringJob] =
    useState<StaffRevenueDetailJob | null>(null);

  const fetchDetail = () => {
    setIsLoading(true);
    setError(null);
    revenueService
      .getStaffDetail(row.key, dateRange)
      .then(setDetail)
      .catch(() => setError(t("dashboard.revenue.errors.loadSummary")))
      .finally(() => setIsLoading(false));
  };

  const handleSubmitReason = async () => {
    if (!reasonDialogJob || !reasonText.trim()) return;
    setIsSubmittingReason(true);
    setReasonError(null);
    try {
      await revenueService.updateCancelReason(
        reasonDialogJob.paymentId,
        reasonText.trim(),
      );
      // Refresh detail to show updated reason
      fetchDetail();
      setReasonDialogJob(null);
      setReasonText("");
    } catch {
      setReasonError(
        t("dashboard.revenue.errors.submitReason", {
          defaultValue: "Failed to submit reason",
        }),
      );
    } finally {
      setIsSubmittingReason(false);
    }
  };

  const handleRestore = async (job: StaffRevenueDetailJob) => {
    setRestoringJob(job);
    try {
      await revenueService.restoreBooking(job.paymentId);
      fetchDetail();
      // Notify the page to silently reload the revenue summary
      onDataChanged?.();
    } catch {
      // silently fail — user can retry
    } finally {
      setRestoringJob(null);
    }
  };

  useEffect(() => {
    queueMicrotask(fetchDetail);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.key, dateRange?.startDate, dateRange?.endDate]);

  return (
    <>
      {/* Data row */}
      <div className="flex w-full items-center border-b border-[#DFE1E4] last:border-b-0">
        {/* Nhân viên */}
        <div className="flex w-[320px] shrink-0 flex-1 items-center gap-3 px-6 py-4">
          {row.avatarUrl ? (
            <img
              src={row.avatarUrl}
              alt={row.staffName}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#f04cac]/10"
            />
          ) : (
            <InitialsAvatar
              name={row.staffName}
              className="h-10 w-10 shrink-0"
            />
          )}
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-[#1A1A1A]">
              {row.staffName}
            </p>
            <p className="text-xs text-[#9DA1A7]">ID: #{row.key}</p>
          </div>
        </div>

        {/* Số hóa đơn */}
        <div className="flex w-35 shrink-0 items-center justify-center px-4 py-4">
          <span className="text-sm font-bold text-[#1D1F23]">
            {row.services}
          </span>
          <span className="ml-1 text-xs text-[#9DA1A7]">
            {t("dashboard.revenue.staffTable.colOrders")}
          </span>
        </div>

        {/* Tổng doanh thu */}
        <div className="flex w-40 shrink-0 items-center justify-center px-4 py-4">
          <span className="text-sm font-bold text-[#f04cac]">
            {fmt(row.totalRevenue)}
          </span>
        </div>
      </div>

      {/* Detail section */}
      <div className="border-t border-[#F3F4F6] bg-[#FAFAFA]/50">
        {isLoading && (
          <p className="px-6 py-3 text-sm text-[#9DA1A7]">
            {t("dashboard.revenue.loading")}
          </p>
        )}
        {error && <p className="px-6 py-3 text-sm text-red-600">{error}</p>}
        {detail && detail.jobs.length === 0 && (
          <p className="px-6 py-3 text-sm text-[#9DA1A7]">
            {t("dashboard.revenue.staffDetail.noJobs")}
          </p>
        )}

        {(detail?.jobs ?? []).length > 0 && (
          <div className="overflow-x-auto px-6 py-4">
            <table className="w-full border-collapse overflow-hidden rounded-[6px]">
              <thead>
                <tr>
                  <th className="px-4 py-1 text-left text-[10px] font-bold uppercase tracking-wide text-[#9DA1A7]">
                    {t("dashboard.revenue.staffDetail.guest")}
                  </th>
                  <th className="px-4 py-1 text-right text-[10px] font-bold uppercase tracking-wide text-[#9DA1A7]">
                    {t("dashboard.revenue.table.totalRevenue")}
                  </th>
                  <th className="w-10 px-2" />
                </tr>
              </thead>
              <tbody>
                {detail!.jobs.map((job) => {
                  const isJobCancelled = job.status === "cancelled";
                  const isJobCompleted = job.status === "completed";
                  const canRestore = isJobCancelled || isJobCompleted;
                  return (
                    <tr
                      key={job.paymentId}
                      className="h-9 border-b border-[#DFE1E4] transition-colors last:border-b-0 hover:bg-white"
                    >
                      <td className="px-4 text-sm font-medium text-[#1D1F23]">
                        <div className="flex items-center gap-2">
                          <span
                            className="cursor-pointer hover:underline"
                            onClick={() => setSelectedJob(job)}
                          >
                            {job.guestName}
                          </span>
                          {isJobCancelled && (
                            <Badge className="bg-orange-500 text-[10px] text-white">
                              {t("dashboard.revenue.staffDetail.cancel", {
                                defaultValue: "Cancel",
                              })}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 text-right text-sm font-bold text-[#1D1F23]">
                        {isJobCancelled ? (
                          <span className="text-[#9DA1A7] line-through">
                            {fmt(job.finalAmount)}
                          </span>
                        ) : (
                          fmt(job.finalAmount)
                        )}
                      </td>
                      <td className="w-10 px-2 text-center">
                        {canRestore && (
                          <DropdownMenu>
                            <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[#F3F4F6]">
                              <MoreVertical className="h-4 w-4 text-[#9DA1A7]" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isJobCancelled && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setReasonDialogJob(job);
                                    setReasonText(job.cancelReason ?? "");
                                  }}
                                >
                                  {job.cancelReason
                                    ? t(
                                        "dashboard.revenue.staffDetail.editReason",
                                        {
                                          defaultValue: "Edit Reason",
                                        },
                                      )
                                    : t(
                                        "dashboard.revenue.staffDetail.addReason",
                                        {
                                          defaultValue: "Add Reason",
                                        },
                                      )}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleRestore(job)}
                                disabled={
                                  restoringJob?.paymentId === job.paymentId
                                }
                                className="text-green-600"
                              >
                                <RotateCcw className="h-4 w-4" />
                                {restoringJob?.paymentId === job.paymentId
                                  ? t(
                                      "dashboard.revenue.staffDetail.restoring",
                                      {
                                        defaultValue: "Restoring...",
                                      },
                                    )
                                  : t(
                                      "dashboard.revenue.staffDetail.restoreToPending",
                                      {
                                        defaultValue: "Restore to Pending",
                                      },
                                    )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailDialog
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {/* Cancel Reason Dialog */}
      {reasonDialogJob && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setReasonDialogJob(null);
              setReasonText("");
              setReasonError(null);
            }
          }}
        >
          <DialogContent className="max-w-sm rounded-[12px] p-0">
            <DialogHeader className="px-6 pt-6 pb-0">
              <DialogTitle className="text-lg font-bold text-[#1A1A1A]">
                {t("dashboard.revenue.staffDetail.cancelReasonTitle", {
                  defaultValue: "Cancellation Reason",
                })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 px-6 pb-6 pt-4">
              <p className="text-sm text-[#9DA1A7]">
                {t("dashboard.revenue.staffDetail.cancelReasonDescription", {
                  defaultValue: "Provide a reason for cancelling this booking.",
                  guestName: reasonDialogJob.guestName,
                })}
              </p>
              <textarea
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
                placeholder={t(
                  "dashboard.revenue.staffDetail.cancelReasonPlaceholder",
                  {
                    defaultValue: "Enter reason...",
                  },
                )}
                className="w-full rounded-lg border border-[#DFE1E4] p-3 text-sm text-[#1A1A1A] outline-none focus:border-primary"
                rows={3}
              />
              {reasonError && (
                <p className="text-sm text-red-500">{reasonError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setReasonDialogJob(null);
                    setReasonText("");
                    setReasonError(null);
                  }}
                  className="rounded-lg border border-[#DFE1E4] px-4 py-2 text-sm font-medium text-[#1A1A1A] hover:bg-[#F3F4F6]"
                >
                  {t("common.cancel", { defaultValue: "Cancel" })}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReason}
                  disabled={isSubmittingReason || !reasonText.trim()}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmittingReason
                    ? t("common.submitting", { defaultValue: "Submitting..." })
                    : t("common.submit", { defaultValue: "Submit" })}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
