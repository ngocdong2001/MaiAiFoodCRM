import {
  CalendarDays,
  CalendarHeart,
  CalendarPlus,
  Dot,
  FlaskConical,
  Mail,
  MapPin,
  MoreHorizontal,
  Pencil,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { Button } from "@/shared/components/ui/button";

import { formatCurrency } from "../../data/data";
import type { GuestActivity, GuestCard } from "../../types/crm.types";

type CRMGuestProfileSectionProps = {
  guest: GuestCard;
  activities: GuestActivity[];
};

const CRMGuestProfileSection = ({
  guest,
  activities,
}: CRMGuestProfileSectionProps) => {
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
                VIP Client
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#8D95A5]">
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {guest.phone}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {guest.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="h-8 border-[#DEE1E7] bg-white px-3 text-xs"
          >
            Message
          </Button>
          <Button className="h-8 bg-primary px-3 text-xs hover:bg-primary/90">
            <CalendarPlus className="mr-1 h-3.5 w-3.5" />
            Book Appointment
          </Button>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#DEE1E7] text-[#8D95A5]"
            aria-label="More actions"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#8D95A5]">Total Spend</p>
            <Sparkles className="h-3.5 w-3.5 text-[#A6B0C2]" />
          </div>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {formatCurrency(guest.lifetimeSpend)}
          </p>
          <p className="text-[10px] text-[#8D95A5]">{guest.ytdDelta} YTD</p>
        </div>
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <p className="text-[11px] text-[#8D95A5]">Total Visits</p>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {guest.totalVisits}
          </p>
        </div>
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <p className="text-[11px] text-[#8D95A5]">No-Shows</p>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {guest.noShows}
          </p>
        </div>
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <p className="text-[11px] text-[#8D95A5]">Client Since</p>
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
                Owner Notes
              </h3>
              <button
                type="button"
                className="text-xs font-medium text-[#8D95A5] hover:underline"
              >
                Edit Notes
              </button>
            </div>
            <p className="rounded-lg border border-[#EDEFF4] bg-[#F8FAFC] p-3 text-sm text-[#3A4354]">
              {guest.notes}
            </p>
          </div>

          <div className="rounded-xl border border-[#EEF1F5] p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171A21]">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                Booking History
              </h3>
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
              >
                View All
              </button>
            </div>

            <ul className="space-y-2">
              {activities.map((activity) => (
                <li
                  key={activity.key}
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
                    </div>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[#8D95A5]">
                      <CalendarDays className="h-3 w-3" />
                      {activity.date}
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
              Preferences
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {guest.preferences.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#F3F5F9] px-2 py-0.5 text-[11px] text-[#566074]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#EEF1F5] p-3">
            <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8A65D1]">
              <FlaskConical className="h-3.5 w-3.5" />
              Technical Formulas
            </h3>
            <div className="mt-2 space-y-2">
              <div className="rounded-lg border border-[#EEF1F5] p-2">
                <p className="text-[10px] font-semibold text-[#8D95A5]">
                  BASE COLOR
                </p>
                <p className="text-xs text-[#374357]">{guest.baseColor}</p>
              </div>
              <div className="rounded-lg border border-[#EEF1F5] p-2">
                <p className="text-[10px] font-semibold text-[#8D95A5]">
                  TONER
                </p>
                <p className="text-xs text-[#374357]">{guest.toner}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#EEF1F5] p-3">
            <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171A21]">
              <MapPin className="h-3.5 w-3.5 text-[#8D95A5]" />
              Details
            </h3>
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-semibold text-[#8D95A5]">
                Address
              </p>
              <p className="text-xs text-[#374357]">{guest.address}</p>
              <p className="text-xs text-[#374357]">{guest.city}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#8D95A5]">
                <CalendarHeart className="h-3 w-3" />
                Birthday
              </p>
              <p className="text-xs text-[#374357]">{guest.birthday}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CRMGuestProfileSection;
