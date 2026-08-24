"use client";
import { Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/core/store/authStore";
import { BookingFormContent } from "@/features/dashboard/calendar/components/BookingFormDialog";

const WelcomeSection = () => {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(" ")[0] ?? t("dashboard.overview.welcome.fallbackName");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [openAsWalkIn, setOpenAsWalkIn] = useState(false);

  const openBooking = (walkIn: boolean) => {
    setOpenAsWalkIn(walkIn);
    setBookingOpen(true);
  };

  return (
    <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171A21] sm:text-3xl">
          {t("dashboard.overview.welcome.title", { name: firstName })}
        </h1>
        <p className="mt-1 text-sm text-[#8D95A5] sm:text-base">
          {t("dashboard.overview.welcome.subtitle")}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          onClick={() => openBooking(false)}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-[#DEE1E7] bg-[#F9FAFB] px-4 text-sm font-medium text-[#171A21] transition-colors hover:bg-[#F0F1F3]"
        >
          <Plus className="h-4 w-4" />
          {t("dashboard.overview.welcome.newBooking")}
        </button>
        <button
          type="button"
          onClick={() => openBooking(true)}
          className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          <UserPlus className="h-4 w-4" />
          {t("dashboard.overview.welcome.addWalkIn")}
        </button>
      </div>

      <BookingFormContent
        key={String(openAsWalkIn)}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        initialDate={new Date()}
        onCreated={() => setBookingOpen(false)}
        defaultWalkIn={openAsWalkIn}
      />
    </section>
  );
};

export default WelcomeSection;
