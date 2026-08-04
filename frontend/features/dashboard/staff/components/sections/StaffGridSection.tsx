import StaffCard from "../StaffCard";
import type { StaffMember } from "../../types/staff.types";

type StaffGridSectionProps = {
  members: StaffMember[];
};

const StaffGridSection = ({ members }: StaffGridSectionProps) => {
  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#DEE1E7] bg-white p-8 text-center text-sm text-[#8D95A5]">
        No staff matched your search/filter.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {members.map((member) => (
        <StaffCard key={member.key} member={member} />
      ))}
    </div>
  );
};

export default StaffGridSection;
