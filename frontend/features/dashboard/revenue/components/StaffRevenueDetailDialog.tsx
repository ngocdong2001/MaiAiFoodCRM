"use client";

import { Tag, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import LoadingState from "@/shared/components/molecules/LoadingState";
import { Badge } from "@/shared/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Separator } from "@/shared/components/ui/separator";
import {
  revenueService,
  type StaffRevenueDetailResponse,
} from "../services/revenue.service";

interface Props {
  staffKey: string | null;
  staffName: string;
  dateRange?: { startDate?: string; endDate?: string };
  onClose: () => void;
}

const StaffRevenueDetailDialog = ({
  staffKey,
  staffName,
  dateRange,
  onClose,
}: Props) => {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<StaffRevenueDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpen = staffKey !== null;

  useEffect(() => {
    if (!staffKey) return;

    let cancelled = false;
    queueMicrotask(() => {
      setIsLoading(true);
      setError(null);
      setDetail(null);

      revenueService
        .getStaffDetail(staffKey, dateRange)
        .then((data) => {
          if (!cancelled) setDetail(data);
        })
        .catch(() => {
          if (!cancelled) setError(t("dashboard.revenue.errors.loadSummary"));
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [staffKey, dateRange, t]);

  const fmt = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[12px] p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-4">
            {detail?.staffAvatarUrl ? (
              <img
                src={detail.staffAvatarUrl}
                alt={detail.staffName}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <InitialsAvatar name={staffName} className="h-14 w-14 text-lg" />
            )}
            <div>
              <DialogTitle className="text-xl font-bold text-[#171A21]">
                {detail?.staffName ?? staffName}
              </DialogTitle>
              {detail?.staffRole && (
                <p className="text-sm text-[#8D95A5]">{detail.staffRole}</p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 pt-4 space-y-5">
          {/* Summary stats */}
          {detail && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[10px] bg-[#F6F7F9] p-4 text-center">
                <p className="text-xs text-[#8D95A5]">
                  {t("dashboard.revenue.table.totalRevenue")}
                </p>
                <p className="mt-1 text-lg font-bold text-primary">
                  {fmt(detail.totalRevenue)}
                </p>
              </div>
              <div className="rounded-[10px] bg-[#F6F7F9] p-4 text-center">
                <p className="text-xs text-[#8D95A5]">
                  {t("dashboard.revenue.table.tips")}
                </p>
                <p className="mt-1 text-lg font-bold text-[#10B981]">
                  {fmt(detail.totalTips)}
                </p>
              </div>
              <div className="rounded-[10px] bg-[#F6F7F9] p-4 text-center">
                <p className="text-xs text-[#8D95A5]">
                  {t("dashboard.revenue.table.services")}
                </p>
                <p className="mt-1 text-lg font-bold text-[#1D1F23]">
                  {detail.totalJobs}
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Job list */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#1D1F23]">
              <TrendingUp className="h-4 w-4 text-primary" />
              {t("dashboard.revenue.staffDetail.jobHistory", {
                defaultValue: "Job History",
              })}
            </h3>

            {isLoading && (
              <LoadingState compact label={t("dashboard.revenue.loading")} />
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}

            {detail && detail.jobs.length === 0 && (
              <p className="text-sm text-[#8D95A5]">
                {t("dashboard.revenue.staffDetail.noJobs", {
                  defaultValue: "No jobs found for this period.",
                })}
              </p>
            )}

            <ul className="space-y-3">
              {(detail?.jobs ?? []).map((job) => (
                <li
                  key={job.paymentId}
                  className="rounded-[10px] border border-[#DFE1E4] bg-white p-4"
                >
                  {/* Guest + date row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {job.guestAvatarUrl ? (
                        <img
                          src={job.guestAvatarUrl}
                          alt={job.guestName}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <InitialsAvatar
                          name={job.guestName}
                          className="h-9 w-9 text-xs"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#1D1F23]">
                          {job.guestName}
                        </p>
                        <p className="text-xs text-[#8D95A5]">
                          {fmtDate(job.paidAt)}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Services performed */}
                  {job.services.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {job.services.map((svc) => (
                        <Badge
                          key={svc.serviceId}
                          variant="secondary"
                          className="gap-1 text-xs"
                        >
                          <Tag className="h-3 w-3" />
                          {svc.serviceName} — {fmt(svc.price)}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Financial breakdown */}
                  <div className="mt-3 grid grid-cols-4 gap-2 rounded-[8px] bg-[#F6F7F9] px-3 py-2 text-xs">
                    <div>
                      <p className="text-[#8D95A5]">
                        {t("dashboard.revenue.staffDetail.amount", {
                          defaultValue: "Amount",
                        })}
                      </p>
                      <p className="font-medium text-[#1D1F23]">
                        {fmt(job.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#8D95A5]">
                        {t("dashboard.revenue.staffDetail.discount", {
                          defaultValue: "Discount",
                        })}
                      </p>
                      <p className="font-medium text-red-500">
                        -{fmt(job.discountAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#8D95A5]">
                        {t("dashboard.revenue.table.tips")}
                      </p>
                      <p className="font-medium text-[#10B981]">
                        +{fmt(job.tipAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#8D95A5]">
                        {t("dashboard.revenue.staffDetail.final", {
                          defaultValue: "Final",
                        })}
                      </p>
                      <p className="font-bold text-primary">
                        {fmt(job.finalAmount)}
                      </p>
                    </div>
                  </div>

                  {job.receiptNumber && (
                    <p className="mt-2 text-xs text-[#B0B5BF]">
                      #{job.receiptNumber}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffRevenueDetailDialog;
