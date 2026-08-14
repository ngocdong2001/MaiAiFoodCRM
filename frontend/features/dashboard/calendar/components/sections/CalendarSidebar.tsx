"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import BookingFormDialog from "../BookingFormDialog";
import MiniCalendar from "./MiniCalendar";
import StaffFilters from "./StaffFilters";

const CalendarSidebar = () => {
  const [bookingOpen, setBookingOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      <aside className="flex w-full flex-col gap-6 rounded-xl border border-[#DEE1E7] bg-[#F9FAFB] p-6 shadow-[0px_1px_2px_0px_#0000000a]">
      <button
        type="button"
        onClick={() => setBookingOpen(true)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-primary px-8 text-sm font-semibold text-white shadow-[0px_2px_4px_0px_#00000012] transition-colors hover:bg-primary/90"
      >
        <Plus className="h-5 w-5" />
        {t("dashboard.calendar.newBooking")}
      </button>

      <MiniCalendar />
      <StaffFilters />
      </aside>
      <BookingFormDialog open={bookingOpen} onOpenChange={setBookingOpen} />
    </>
  );
};

export default CalendarSidebar;
