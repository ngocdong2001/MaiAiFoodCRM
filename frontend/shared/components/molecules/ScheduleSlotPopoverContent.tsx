type ScheduleSlotWorkItem = {
  id: string;
  title: string;
  timeRange: string;
  detail?: string;
};

type ScheduleSlotPopoverContentProps = {
  staffName: string;
  staffRole?: string;
  periodLabel: string;
  slotType?: "work" | "break";
  note?: string;
  workItems?: ScheduleSlotWorkItem[];
};

const ScheduleSlotPopoverContent = ({
  workItems = [],
}: ScheduleSlotPopoverContentProps) => {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-[#171A21]">Assigned work</p>
        {workItems.length === 0 ? (
          <p className="mt-1 text-xs text-[#8D95A5]">
            No appointments in this time range.
          </p>
        ) : (
          <div className="mt-1 space-y-1.5">
            {workItems.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-[#ECEFF4] px-2.5 py-2"
              >
                <p className="truncate text-xs font-medium text-[#171A21]">
                  {item.title}
                </p>
                <p className="text-[11px] text-[#8D95A5]">{item.timeRange}</p>
                {item.detail ? (
                  <p className="truncate text-[11px] text-[#8D95A5]">
                    {item.detail}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export type { ScheduleSlotWorkItem };
export default ScheduleSlotPopoverContent;
