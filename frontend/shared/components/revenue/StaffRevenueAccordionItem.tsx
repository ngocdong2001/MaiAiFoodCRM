"use client";

import {
  Banknote,
  CreditCard,
  Smartphone,
  Star,
  Tag,
  Wallet,
} from "lucide-react";
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
import { Separator } from "@/shared/components/ui/separator";
import {
  revenueService,
  type StaffRevenueDetailJob,
  type StaffRevenueDetailResponse,
  type StaffRevenueRow,
} from "@/features/dashboard/revenue/services/revenue.service";

const PAYMENT_ICON: Record<string, React.ReactNode> = {
  cash: <Banknote className="h-3.5 w-3.5" />,
  card: <CreditCard className="h-3.5 w-3.5" />,
  transfer: <Wallet className="h-3.5 w-3.5" />,
  ewallet: <Smartphone className="h-3.5 w-3.5" />,
  loyalty_points: <Star className="h-3.5 w-3.5" />,
};

const PAYMENT_COLOR: Record<string, string> = {
  cash: "bg-pink-100 text-pink-700",
  card: "bg-yellow-100 text-yellow-700",
  transfer: "bg-teal-100 text-teal-700",
  ewallet: "bg-blue-100 text-blue-700",
  loyalty_points: "bg-purple-100 text-purple-700",
};

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

          {/* Payment method */}
          <div className="flex items-center justify-between rounded-[10px] bg-[#F6F7F9] px-4 py-3">
            <span className="text-xs text-[#9DA1A7]">
              {t("dashboard.revenue.staffDetail.paymentMethod", {
                defaultValue: "Payment Method",
              })}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_COLOR[job.paymentMethod] ?? "bg-gray-100 text-gray-700"}`}
            >
              {PAYMENT_ICON[job.paymentMethod]}
              {t(`dashboard.revenue.paymentMethodLabels.${job.paymentMethod}`, {
                defaultValue: job.paymentMethod,
              })}
            </span>
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
}

export function StaffRevenueAccordionItem({
  row,
  dateRange,
}: Props) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<StaffRevenueDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<StaffRevenueDetailJob | null>(
    null,
  );

  const fetchDetail = () => {
    setIsLoading(true);
    setError(null);
    revenueService
      .getStaffDetail(row.key, dateRange)
      .then(setDetail)
      .catch(() => setError(t("dashboard.revenue.errors.loadSummary")))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.key, dateRange?.startDate, dateRange?.endDate]);

  return (
    <>
      {/* Data row */}
      <div className="flex w-full items-center border-b border-[#DFE1E4] last:border-b-0">
        {/* Nhân viên */}
        <div className="flex w-[320px] shrink-0 items-center gap-3 px-6 py-4">
          {row.avatarUrl ? (
            <img
              src={row.avatarUrl}
              alt={row.staffName}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#f04cac]/10"
            />
          ) : (
            <InitialsAvatar name={row.staffName} className="h-10 w-10 shrink-0" />
          )}
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-[#1A1A1A]">{row.staffName}</p>
            <p className="text-xs text-[#9DA1A7]">
              ID: #{row.key}
            </p>
          </div>
        </div>

        {/* Số hóa đơn */}
        <div className="flex w-35 shrink-0 items-center justify-center px-4 py-4">
          <span className="text-sm font-bold text-[#1D1F23]">{row.services}</span>
          <span className="ml-1 text-xs text-[#9DA1A7]">
            {t("dashboard.revenue.staffTable.colOrders")}
          </span>
        </div>

        {/* Tổng doanh thu */}
        <div className="flex w-40 shrink-0 items-center px-4 py-4">
          <span className="text-sm font-bold text-[#f04cac]">{fmt(row.totalRevenue)}</span>
        </div>

        {/* Dịch vụ thực hiện */}
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 px-4 py-4">
          {(row.recentServiceNames ?? []).slice(0, 2).map((name) => (
            <span
              key={name}
              className="shrink-0 rounded-full bg-[#EAECEE]/80 px-2.5 py-1 text-[11px] text-[#1D1F23]"
            >
              {name}
            </span>
          ))}
        </div>

        {/* Menu */}
        <div className="flex w-10 shrink-0 items-center justify-center">
          <button className="flex h-8 w-8 items-center justify-center rounded-[6px] transition-colors hover:bg-[#F3F4F6]">
            <span className="text-lg leading-none text-[#9DA1A7]">⋮</span>
          </button>
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
                  <th className="px-4 py-1 text-left text-[10px] font-bold uppercase tracking-wide text-[#9DA1A7]">
                    {t("dashboard.revenue.staffTable.colServices")}
                  </th>
                  <th className="px-4 py-1 text-right text-[10px] font-bold uppercase tracking-wide text-[#9DA1A7]">
                    {t("dashboard.revenue.table.totalRevenue")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {detail!.jobs.map((job) => (
                  <tr
                    key={job.paymentId}
                    onClick={() => setSelectedJob(job)}
                    className="h-9 cursor-pointer border-b border-[#DFE1E4] transition-colors last:border-b-0 hover:bg-white"
                  >
                    <td className="px-4 text-sm font-medium text-[#1D1F23]">
                      {job.guestName}
                    </td>
                    <td className="px-4">
                      <div className="flex flex-wrap gap-1">
                        {job.services.length > 0 ? (
                          job.services.map((s) => (
                            <span key={s.serviceId} className="text-sm text-[#1D1F23]">
                              {s.serviceName}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-[#9DA1A7]">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 text-right text-sm font-bold text-[#1D1F23]">
                      {fmt(job.finalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailDialog job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </>
  );
}
