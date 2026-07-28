import { ChevronRight } from "lucide-react";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { recentGuests } from "@/features/dashboard/overview/data/data";

const RecentGuestsSection = () => {
  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <h2 className="text-base font-semibold text-[#171A21]">Recent Guests</h2>
      <p className="mt-0.5 text-sm text-[#8D95A5]">Latest guest interactions</p>

      <ul className="mt-4 space-y-1">
        {recentGuests.map((guest) => (
          <li key={guest.key}>
            <a
              href="#"
              className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[#F9FAFB]"
            >
              <div className="flex items-center gap-3">
                <InitialsAvatar name={guest.name} className="h-9 w-9" />
                <div>
                  <p className="text-sm font-medium text-[#171A21]">
                    {guest.name}
                  </p>
                  <p className="text-xs text-[#8D95A5]">{guest.meta}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#C3C8D1]" />
            </a>
          </li>
        ))}
      </ul>

      <a
        href="#"
        className="mt-4 block text-center text-sm font-medium text-[#F04CAC] hover:underline"
      >
        View All Guests
      </a>
    </section>
  );
};

export default RecentGuestsSection;

