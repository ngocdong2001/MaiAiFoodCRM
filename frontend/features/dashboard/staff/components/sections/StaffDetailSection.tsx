import {
  BarChart3,
  CalendarDays,
  Clock3,
  Contact,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";

import InitialsAvatar from "@/shared/components/atoms/InitialsAvatar";
import { Button } from "@/shared/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/shared/components/ui/drawer";

import { formatCurrency } from "../../utils/format";
import type { StaffMember } from "../../types/staff.types";

type StaffDetailSectionProps = {
  member: StaffMember;
};

const StaffDetailSection = ({ member }: StaffDetailSectionProps) => {
  return (
    <section className="border-t border-[#EEF1F5] p-4 sm:p-5 xl:border-l xl:border-t-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <InitialsAvatar
            name={member.name}
            className="h-13 w-13 text-sm"
            online={member.status === "On Shift"}
          />
          <div className="min-w-0">
            <h2 className="truncate text-[28px] leading-none font-semibold text-[#171A21]">
              {member.name}
            </h2>
            <p className="mt-1 text-xs text-[#8D95A5]">
              {member.role} • {member.station}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#8D95A5]">
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {member.phone}
              </span>
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {member.email}
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

          <Drawer modal swipeDirection="right">
            <DrawerTrigger
              render={
                <Button className="h-8 bg-primary px-3 text-xs hover:bg-primary/90" />
              }
            >
              View Details
            </DrawerTrigger>
            <DrawerContent className="data-[swipe-axis=x]:[--drawer-content-width:min(560px,92vw)]">
              <DrawerHeader className="border-b border-[#EEF1F5] px-5 pb-4 pt-5 text-left">
                <DrawerTitle className="text-xl font-semibold text-[#171A21]">
                  Staff Profile
                </DrawerTitle>
                <DrawerDescription className="text-sm text-[#8D95A5]">
                  Manage profile, schedule, and performance details.
                </DrawerDescription>
              </DrawerHeader>

              <div className="space-y-4 overflow-y-auto px-5 py-4">
                <div className="rounded-xl border border-[#EEF1F5] p-4">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar
                      name={member.name}
                      className="h-12 w-12"
                      online={member.status === "On Shift"}
                    />
                    <div>
                      <p className="text-base font-semibold text-[#171A21]">
                        {member.name}
                      </p>
                      <p className="text-sm text-[#8D95A5]">{member.role}</p>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#566074]">
                    <p className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      Shift: {member.shift}
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Joined: {member.joinedAt}
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <Contact className="h-3.5 w-3.5" />
                      {member.phone}
                    </p>
                    <p className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {member.station}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="rounded-lg border border-[#E7EBF2] bg-[#FAFBFE] p-3">
                    <p className="text-[11px] text-[#8D95A5]">Utilization</p>
                    <p className="mt-1 text-sm font-semibold text-[#171A21]">
                      {member.utilizationRate}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E7EBF2] bg-[#FAFBFE] p-3">
                    <p className="text-[11px] text-[#8D95A5]">Avg Ticket</p>
                    <p className="mt-1 text-sm font-semibold text-[#171A21]">
                      {formatCurrency(member.averageTicket)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E7EBF2] bg-[#FAFBFE] p-3">
                    <p className="text-[11px] text-[#8D95A5]">
                      Monthly Revenue
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#171A21]">
                      {formatCurrency(member.monthlyRevenue)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-[#E7EBF2] bg-[#FAFBFE] p-3">
                    <p className="text-[11px] text-[#8D95A5]">Cancellation</p>
                    <p className="mt-1 text-sm font-semibold text-[#171A21]">
                      {member.cancellationRate}%
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#EEF1F5] p-3">
                  <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171A21]">
                    <Star className="h-3.5 w-3.5 text-[#4F5E79]" />
                    Top Services
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {member.topServices.map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-[#F3F5F9] px-2 py-0.5 text-[11px] text-[#566074]"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[#EEF1F5] p-3">
                  <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171A21]">
                    <Sparkles className="h-3.5 w-3.5 text-[#6A7890]" />
                    Certifications
                  </h3>
                  <ul className="mt-2 space-y-1 text-xs text-[#566074]">
                    {member.certifications.map((cert) => (
                      <li
                        key={cert}
                        className="inline-flex items-center gap-1.5"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#AAB3C1]" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#EEF1F5] p-3">
                  <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#171A21]">
                    <BarChart3 className="h-3.5 w-3.5 text-[#6A7890]" />
                    Manager Notes
                  </h3>
                  <p className="mt-2 text-sm text-[#3A4354]">{member.note}</p>
                </div>
              </div>

              <DrawerFooter className="border-t border-[#EEF1F5] px-5 pb-5 pt-4 sm:flex-row sm:justify-end">
                <DrawerClose
                  render={
                    <Button
                      variant="outline"
                      className="h-9 border-[#DEE1E7] bg-white px-4"
                    />
                  }
                >
                  Close
                </DrawerClose>
                <Button className="h-9 bg-primary px-4 hover:bg-primary/90">
                  Save Changes
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <p className="text-[11px] text-[#8D95A5]">Utilization</p>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {member.utilizationRate}%
          </p>
        </div>
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <p className="text-[11px] text-[#8D95A5]">Appointments</p>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {member.appointmentsCompleted}
          </p>
        </div>
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <p className="text-[11px] text-[#8D95A5]">Avg Ticket</p>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {formatCurrency(member.averageTicket)}
          </p>
        </div>
        <div className="rounded-xl border border-[#E7EBF2] bg-[#FAFBFE] p-3.5">
          <p className="text-[11px] text-[#8D95A5]">Monthly Revenue</p>
          <p className="mt-1 text-sm font-bold text-[#171A21]">
            {formatCurrency(member.monthlyRevenue)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="rounded-xl border border-[#EEF1F5] p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#171A21]">
              Staff Notes
            </h3>
            <button
              type="button"
              className="text-xs font-medium text-[#8D95A5] hover:underline"
            >
              Edit Notes
            </button>
          </div>
          <p className="rounded-lg border border-[#EDEFF4] bg-[#F8FAFC] p-3 text-sm text-[#3A4354]">
            {member.note}
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-[#EEF1F5] p-3">
            <h3 className="text-sm font-semibold text-[#171A21]">Shift</h3>
            <p className="mt-1 text-xs text-[#8D95A5]">Today&apos;s schedule</p>
            <p className="mt-2 text-sm font-medium text-[#171A21]">
              {member.shift}
            </p>
          </div>

          <div className="rounded-xl border border-[#EEF1F5] p-3">
            <h3 className="text-sm font-semibold text-[#171A21]">
              Top Services
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {member.topServices.map((service) => (
                <span
                  key={service}
                  className="rounded-full bg-[#F3F5F9] px-2 py-0.5 text-[11px] text-[#566074]"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StaffDetailSection;
