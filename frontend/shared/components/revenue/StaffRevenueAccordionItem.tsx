"use client";

import {
  Banknote,
  ChevronRight,
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
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
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

// ── Main accordion item ────────────────────────────────────────────────────────
interface Props {
  row: StaffRevenueRow;
  index: number;
  isGood: boolean;
  dateRange?: { startDate?: string; endDate?: string };
}

export function StaffRevenueAccordionItem({
  row,
  index,
  isGood,
  dateRange,
}: Props) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<StaffRevenueDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);
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

  const handleOpenChange = (open: boolean) => {
    if (!open || fetched) return;
    setFetched(true);
    fetchDetail();
  };

  // Re-fetch when dateRange changes after first open
  useEffect(() => {
    if (!fetched) return;
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange?.startDate, dateRange?.endDate]);

  return (
    <>
      <AccordionItem
        value={row.key}
        onOpenChange={handleOpenChange}
        className="border-b border-[#DFE1E4] last:border-b-0"
      >
        <AccordionTrigger className="items-center px-0 py-0 hover:no-underline [&_[data-slot=accordion-trigger-icon]]:ml-0 [&_[data-slot=accordion-trigger-icon]]:mr-4 [&_[data-slot=accordion-trigger-icon]]:text-[#C4C9D4]">
          <div className="flex w-full items-center gap-0 transition-colors hover:bg-[#FFF3F8]/40">
            {/* Rank badge */}
            <div className="flex w-10 shrink-0 items-center justify-center self-stretch bg-[#FAFAFA] text-sm font-bold text-[#9DA1A7]">
              {index + 1}
            </div>

            {/* Avatar + name */}
            <div className="flex flex-1 items-center gap-3 px-4 py-4">
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
                {(row.recentServiceNames ?? []).length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {row.recentServiceNames.slice(0, 2).map((name) => (
                      <span
                        key={name}
                        className="rounded-full bg-[#EAECEE]/80 px-2 py-px text-[10px] text-[#6B7280]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-10 w-px shrink-0 bg-[#F3F4F6]" />

            {/* Stat: orders */}
            <div className="hidden w-32 shrink-0 flex-col items-center px-4 py-4 sm:flex">
              <p className="text-lg font-bold text-[#1A1A1A]">{row.services}</p>
              <p className="text-[11px] text-[#9DA1A7]">
                {t("dashboard.revenue.cards.ordersUnit")}
              </p>
            </div>

            {/* Divider */}
            <div className="hidden h-10 w-px shrink-0 bg-[#F3F4F6] sm:block" />

            {/* Stat: revenue */}
            <div className="flex w-36 shrink-0 flex-col items-center px-4 py-4">
              <p className="text-lg font-bold text-[#f04cac]">
                {fmt(row.totalRevenue)}
              </p>
              <p className="text-[11px] text-[#9DA1A7]">
                {t("dashboard.revenue.staffTable.colRevenue")}
              </p>
            </div>

            {/* Divider */}
            <div className="h-10 w-px shrink-0 bg-[#F3F4F6]" />

            {/* Perf badge */}
            <div className="flex w-28 shrink-0 items-center justify-center px-4 py-4">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  isGood
                    ? "bg-[#ECFDF5] text-[#059669]"
                    : "bg-[#FFF7ED] text-[#EA580C]"
                }`}
              >
                {isGood
                  ? t("dashboard.revenue.perf.good")
                  : t("dashboard.revenue.perf.stable")}
              </span>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="pb-4 pt-0">
          {isLoading && (
            <p className="px-6 py-3 text-sm text-[#9DA1A7]">
              {t("dashboard.revenue.loading")}
            </p>
          )}
          {error && <p className="px-6 py-3 text-sm text-red-600">{error}</p>}
          {detail && detail.jobs.length === 0 && (
            <p className="px-6 py-3 text-sm text-[#9DA1A7]">
              {t("dashboard.revenue.staffDetail.noJobs", {
                defaultValue: "No jobs found.",
              })}
            </p>
          )}

          {(detail?.jobs ?? []).length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-y border-[#F3F4F6] bg-[#FAFAFA]">
                    <th className="px-6 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-[#9DA1A7]">
                      {t("dashboard.revenue.staffDetail.guest", {
                        defaultValue: "Khách",
                      })}
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-[#9DA1A7]">
                      {t("dashboard.revenue.staffDetail.services", {
                        defaultValue: "Dịch vụ",
                      })}
                    </th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-wide text-[#9DA1A7]">
                      {t("dashboard.revenue.staffDetail.paymentMethod", {
                        defaultValue: "Thanh toán",
                      })}
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-[#9DA1A7]">
                      {t("dashboard.revenue.staffDetail.final", {
                        defaultValue: "Thực thu",
                      })}
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-medium uppercase tracking-wide text-[#9DA1A7]">
                      {t("dashboard.revenue.staffDetail.time", {
                        defaultValue: "Thời gian",
                      })}
                    </th>
                    <th className="w-10 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {detail!.jobs.map((job) => (
                    <tr
                      key={job.paymentId}
                      onClick={() => setSelectedJob(job)}
                      className="cursor-pointer border-b border-[#F3F4F6] transition-colors hover:bg-[#FFF3F8]/40 last:border-b-0"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2.5">
                          {job.guestAvatarUrl ? (
                            <img
                              src={job.guestAvatarUrl}
                              alt={job.guestName}
                              className="h-8 w-8 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <InitialsAvatar
                              name={job.guestName}
                              className="h-8 w-8 shrink-0 text-xs"
                            />
                          )}
                          <span className="text-sm font-medium text-[#1A1A1A]">
                            {job.guestName}
                          </span>
                        </div>
                      </td>
                      <td className="max-w-[220px] px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {job.services.length > 0 ? (
                            job.services.map((s) => (
                              <span
                                key={s.serviceId}
                                className="rounded-full bg-[#EAECEE]/80 px-2 py-0.5 text-[11px] text-[#1D1F23]"
                              >
                                {s.serviceName}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#9DA1A7]">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${PAYMENT_COLOR[job.paymentMethod] ?? "bg-gray-100 text-gray-700"}`}
                        >
                          {PAYMENT_ICON[job.paymentMethod]}
                          {t(
                            `dashboard.revenue.paymentMethodLabels.${job.paymentMethod}`,
                            {
                              defaultValue: job.paymentMethod,
                            },
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-[#f04cac]">
                        {fmt(job.finalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-[#9DA1A7]">
                        {fmtTime(job.paidAt)}
                      </td>
                      <td className="px-2 py-3">
                        <ChevronRight className="h-4 w-4 text-[#9DA1A7]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      {selectedJob && (
        <JobDetailDialog
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
}
