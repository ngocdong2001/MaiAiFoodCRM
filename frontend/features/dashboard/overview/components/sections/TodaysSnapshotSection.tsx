import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { todaysSnapshot } from "@/features/dashboard/overview/data/data";

const TodaysSnapshotSection = () => {
  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white p-5 shadow-[0px_1px_2px_0px_#0000000a]">
      <h2 className="text-base font-semibold text-[#171A21]">
        Today&apos;s Snapshot
      </h2>
      <p className="mt-0.5 text-sm text-[#8D95A5]">
        Upcoming appointments and staff shifts
      </p>

      <ul className="mt-4 space-y-4">
        {todaysSnapshot.map((item) => (
          <li
            key={item.key}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#F04CAC]" />
              <span className="w-16 shrink-0 text-sm font-medium text-[#8D95A5]">
                {item.time}
              </span>
              <span className="text-sm text-[#171A21]">{item.title}</span>
            </div>
            {item.assignee && (
              <div className="flex items-center gap-2">
                <InitialsAvatar name={item.assignee} className="h-6 w-6" />
                <span className="hidden text-xs text-[#8D95A5] sm:block">
                  {item.assignee}
                </span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TodaysSnapshotSection;

