import { Plus } from "lucide-react";

import MiniCalendar from "./MiniCalendar";
import StaffFilters from "./StaffFilters";

const CalendarSidebar = () => {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-6 border-b border-[#DEE1E7] bg-[#F9FAFB] p-6 lg:w-72 lg:border-b-0 lg:border-r">
      <button
        type="button"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#F04CAC] px-8 text-sm font-semibold text-white shadow-[0px_2px_4px_0px_#00000012] transition-colors hover:bg-[#E03A9B]"
      >
        <Plus className="h-5 w-5" />
        New Booking
      </button>

      <MiniCalendar />
      <StaffFilters />
    </aside>
  );
};

export default CalendarSidebar;
