import {
  CalendarDays,
  CalendarHeart,
  Cake,
  Dot,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Sparkles,
  Star,
  Trash2,
  UserRoundPen,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { Badge } from "@/shared/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import type { GuestCard } from "../../types/crm.types";

type CRMGuestProfileSectionProps = {
  guest: GuestCard;
  onEdit: () => void;
  onEditNotes: () => void;
  onDelete: () => void;
};

// Matches the palette used across the calendar's booking status controls.
const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: "bg-[#F59E0B] text-white",
  confirmed: "bg-primary text-white",
  completed: "bg-[#10B981] text-white",
  cancelled: "bg-[#EF4444] text-white",
  no_show: "bg-[#EF4444] text-white",
  in_progress: "bg-[#8A4CE0] text-white",
};

const STATUS_LABEL_KEY: Record<string, string> = {
  pending: "dashboard.calendar.statusControl.waiting",
  confirmed: "dashboard.calendar.statusControl.ready",
  completed: "dashboard.calendar.statusControl.completed",
  cancelled: "dashboard.calendar.statusControl.cancelled",
  no_show: "dashboard.calendar.statusControl.noShow",
  in_progress: "dashboard.calendar.statusControl.inProgress",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const CRMGuestProfileSection = ({
  guest,
  onEdit,
  onEditNotes,
  onDelete,
}: CRMGuestProfileSectionProps) => {
  const { t, i18n } = useTranslation();
  const formatDate = (value: string | null) =>
    value
      ? new Date(value).toLocaleDateString(i18n.language, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : t("dashboard.crm.profile.notAvailable");
  return (
    <section className="border-t border-[#EEF1F5] p-4 sm:p-5 xl:border-l xl:border-t-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <InitialsAvatar
            name={guest.name}
            className="h-13 w-13 text-sm"
            online
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[30px] leading-none font-semibold text-[#171A21]">
                {guest.name}
              </h2>
              <span className="rounded-full bg-[#F2EEFF] px-2 py-0.5 text-[10px] font-semibold text-[#7A63B8]">
                {t(`dashboard.crm.segments.${guest.segment}`)}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#8D95A5]">
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {guest.phone ?? t("dashboard.crm.profile.noPhone")}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {guest.email ?? t("dashboard.crm.profile.noEmail")}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#DEE1E7] text-[#8D95A5]"
            aria-label="Guest actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <UserRoundPen />
              {t("dashboard.crm.profile.editGuest")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 />
              {t("dashboard.crm.profile.deleteGuest")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#8D95A5]">
              {t("dashboard.crm.profile.totalSpend")}
            </p>
            <Sparkles className="h-3.5 w-3.5 text-[#A6B0C2]" />
          </div>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {formatCurrency(guest.totalSpend)}
          </p>
        </div>
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <p className="text-[11px] text-[#8D95A5]">
            {t("dashboard.crm.profile.totalVisits")}
          </p>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {guest.totalVisits}
          </p>
        </div>
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <p className="text-[11px] text-[#8D95A5]">
            {t("dashboard.crm.profile.noShows")}
          </p>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {guest.noShows}
          </p>
        </div>
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <p className="text-[11px] text-[#8D95A5]">
            {t("dashboard.crm.profile.clientSince")}
          </p>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {guest.clientSince}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-3">
          <div className="rounded-xl border border-[#EEF1F5] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171A21]">
                <Pencil className="h-3.5 w-3.5 text-primary" />
                {t("dashboard.crm.profile.ownerNotes")}
              </h3>
              <button
                type="button"
                onClick={onEditNotes}
                className="text-xs font-medium text-[#8D95A5] hover:underline"
              >
                {t("dashboard.crm.profile.editNotes")}
              </button>
            </div>
            <p className="rounded-lg border border-[#EDEFF4] bg-[#F8FAFC] p-3 text-sm text-[#3A4354]">
              {guest.notes || t("dashboard.crm.profile.noNotes")}
            </p>
          </div>

          <div className="rounded-xl border border-[#EEF1F5] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171A21]">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {t("dashboard.crm.profile.bookingHistory")}
              </h3>
            </div>

            <ul className="space-y-2">
              {guest.activities.map((activity) => (
                <li
                  key={activity.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-[#EEF1F5] bg-[#FAFBFD] p-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#F5A8D4] text-primary">
                        <Dot className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-medium text-[#171A21]">
                        {activity.title}
                      </p>
                      <Badge
                        className={
                          STATUS_BADGE_CLASS[activity.status] ??
                          "bg-[#8D95A5] text-white"
                        }
                      >
                        {STATUS_LABEL_KEY[activity.status]
                          ? t(STATUS_LABEL_KEY[activity.status])
                          : activity.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#8D95A5]">
                      <CalendarDays className="h-3 w-3" />
                      {formatDate(activity.date)}
                      <span>•</span>
                      {activity.technician}
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-[#7C879B]">
                    {formatCurrency(activity.amount)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-[#EEF1F5] p-3">
            <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171A21]">
              <Star className="h-3.5 w-3.5 text-[#4F5E79]" />
              {t("dashboard.crm.profile.preferences")}
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {guest.tags.map((item) => (
                <span
                  key={item.id}
                  className="rounded-full bg-[#F3F5F9] px-2 py-0.5 text-[11px] text-[#566074]"
                >
                  {item.name}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#EEF1F5] p-3">
            <h3 className="text-sm font-semibold text-[#171A21]">
              {t("dashboard.crm.profile.loyalty")}
            </h3>
            <p className="mt-2 text-2xl font-bold text-primary">
              {guest.loyaltyPoints.toLocaleString()}
            </p>
            <p className="text-xs text-[#8D95A5]">
              {t("dashboard.crm.profile.loyaltyPoints")}
            </p>
          </div>

          <div className="rounded-xl border border-[#EEF1F5] p-3">
            <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171A21]">
              <Cake className="h-3.5 w-3.5 text-[#8D95A5]" />
              {t("dashboard.crm.profile.details")}
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-semibold text-[#8D95A5]">
                {t("dashboard.crm.profile.birthday")}
              </p>
              <p className="text-xs text-[#374357]">
                {formatDate(guest.dateOfBirth)}
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#8D95A5]">
                <CalendarHeart className="h-3 w-3" />
                {t("dashboard.crm.profile.nextAppointment")}
              </p>
              <p className="text-xs text-[#374357]">
                {formatDate(guest.nextAppointment)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CRMGuestProfileSection;
