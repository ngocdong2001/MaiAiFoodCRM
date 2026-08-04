import { Sparkles } from "lucide-react";

import type { SchedulerResource } from "@/shared/components/molecules/CalendarScheduler";

import type {
  CalendarAppointment,
  QueueRequest,
  ScheduleColumn,
  StaffMember,
} from "../types/calendar.types";

export const staffMembers: StaffMember[] = [
  { key: "emma", name: "Emma Watson", role: "Senior Stylist", active: true },
  { key: "james", name: "James Rodriguez", role: "Colorist", active: true },
  { key: "sophia", name: "Sophia Chen", role: "Stylist", active: true },
  { key: "marcus", name: "Marcus Johnson", role: "Barber", active: true },
];

export const miniCalendar = {
  monthLabel: "October 2023",
  weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  days: Array.from({ length: 31 }, (_, index) => index + 1),
  selectedDay: 14,
};

export const scheduleColumns: ScheduleColumn[] = [
  { key: "emma", name: "Emma Watson", role: "Senior Stylist" },
  { key: "james", name: "James Rodriguez", role: "Colorist" },
  { key: "sophia", name: "Sophia Chen", role: "Stylist" },
  { key: "marcus", name: "Marcus Johnson", role: "Barber" },
];

export const schedulerResources: SchedulerResource[] = scheduleColumns.map(
  ({ key, name, role }) => ({ key, name, role }),
);

export const schedulerAnchorDate = { year: 2023, month: 9, day: 14 };

export const schedulerDayRange = { startHour: 9, endHour: 18 };

export const dailyScheduleHours = Array.from(
  { length: schedulerDayRange.endHour - schedulerDayRange.startHour + 1 },
  (_, index) => schedulerDayRange.startHour + index,
);

const createDetail = (
  detail: CalendarAppointment["detail"],
): CalendarAppointment["detail"] => detail;

export const schedulerEvents: CalendarAppointment[] = [
  {
    key: "olivia-pope",
    title: "Olivia Pope",
    subtitle: "Balayage & Cut",
    resourceKey: "emma",
    year: 2023,
    month: 9,
    day: 14,
    startHour: 9,
    endHour: 11.5,
    tone: "primary",
    detail: createDetail({
      status: "Confirmed",
      guest: "Olivia Pope",
      membership: "VIP Member",
      visit: "5th Visit",
      service: "Balayage & Custom Cut",
      stylist: "Emma Watson",
      duration: "2.5 hrs",
      timeRange: "08:00 AM - 11:30 AM",
      station: "Station 4",
      stationArea: "Main Floor Area",
      clientNotes:
        "Prefers ashy blonde tones, avoid too much warmth. Sensitive scalp, use gentle developer.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Olaplex Stand-Alone Treatment",
        description:
          "Client is getting a heavy lightening service. Recommend Olaplex to maintain integrity. (+45 min, $65)",
      },
    }),
  },
  {
    key: "mia-wallace",
    title: "Mia Wallace",
    subtitle: "Blowout",
    resourceKey: "emma",
    year: 2023,
    month: 9,
    day: 14,
    startHour: 12,
    endHour: 13,
    tone: "muted",
    detail: createDetail({
      status: "Confirmed",
      guest: "Mia Wallace",
      membership: "Returning Guest",
      visit: "2nd Visit",
      service: "Blowout Refresh",
      stylist: "Emma Watson",
      duration: "1 hr",
      timeRange: "12:00 PM - 01:00 PM",
      station: "Station 2",
      stationArea: "Front Styling Area",
      clientNotes: "Prefers volume at the crown and soft finish on the ends.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Add Texture Spray",
        description:
          "Light upsell for volume retention. Suggest after blowout for long-lasting shape.",
      },
    }),
  },
  {
    key: "vincent-vega",
    title: "Vincent Vega",
    subtitle: "Full Color",
    resourceKey: "james",
    year: 2023,
    month: 9,
    day: 14,
    startHour: 10,
    endHour: 12,
    tone: "danger",
    detail: createDetail({
      status: "Confirmed",
      guest: "Vincent Vega",
      membership: "VIP Member",
      visit: "8th Visit",
      service: "Full Color",
      stylist: "James Rodriguez",
      duration: "2 hrs",
      timeRange: "10:00 AM - 12:00 PM",
      station: "Station 6",
      stationArea: "Color Bar",
      clientNotes: "Always wants a warmer tone than the photo reference.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Color Protect Treatment",
        description:
          "Recommend a color protect add-on to extend tone longevity and shine.",
      },
    }),
  },
  {
    key: "jules-winnfield",
    title: "Jules Winnfield",
    subtitle: "Root Touch-up",
    resourceKey: "james",
    year: 2023,
    month: 9,
    day: 14,
    startHour: 14,
    endHour: 15.5,
    tone: "primary",
    detail: createDetail({
      status: "Pending",
      guest: "Jules Winnfield",
      membership: "Member",
      visit: "4th Visit",
      service: "Root Touch-up",
      stylist: "James Rodriguez",
      duration: "1.5 hrs",
      timeRange: "02:00 PM - 03:30 PM",
      station: "Station 5",
      stationArea: "Color Bar",
      clientNotes: "Needs quick turnaround before evening event.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Express Treatment",
        description:
          "Offer an express gloss after coloring to boost shine without extending the visit.",
      },
    }),
  },
  {
    key: "ella-fox",
    title: "Ella Fox",
    subtitle: "Bridal Updo",
    resourceKey: "sophia",
    year: 2023,
    month: 9,
    day: 14,
    startHour: 11,
    endHour: 13,
    tone: "info",
    detail: createDetail({
      status: "Confirmed",
      guest: "Ella Fox",
      membership: "VIP Member",
      visit: "3rd Visit",
      service: "Bridal Updo",
      stylist: "Sophia Chen",
      duration: "2 hrs",
      timeRange: "11:00 AM - 01:00 PM",
      station: "Station 8",
      stationArea: "Event Styling Area",
      clientNotes: "Bring veil pins and trial photos.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Add Styling Trial Notes",
        description:
          "Recommend documenting exact pin placement for repeatable bridal prep.",
      },
    }),
  },
  {
    key: "leo-park",
    title: "Leo Park",
    subtitle: "Beard Trim",
    resourceKey: "marcus",
    year: 2023,
    month: 9,
    day: 14,
    startHour: 15,
    endHour: 15.5,
    tone: "success",
    detail: createDetail({
      status: "Confirmed",
      guest: "Leo Park",
      membership: "New Client",
      visit: "1st Visit",
      service: "Beard Trim",
      stylist: "Marcus Johnson",
      duration: "30 mins",
      timeRange: "03:00 PM - 03:30 PM",
      station: "Station 9",
      stationArea: "Barber Corner",
      clientNotes: "Keep beard shape clean but not too tight.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Recommend Beard Oil",
        description:
          "A quick product recommendation could increase basket size before checkout.",
      },
    }),
  },
  {
    key: "noah-kim",
    title: "Noah Kim",
    subtitle: "Men's Cut",
    resourceKey: "emma",
    year: 2023,
    month: 9,
    day: 9,
    startHour: 10,
    endHour: 11,
    tone: "muted",
    detail: createDetail({
      status: "Confirmed",
      guest: "Noah Kim",
      membership: "Member",
      visit: "6th Visit",
      service: "Men's Cut",
      stylist: "Emma Watson",
      duration: "1 hr",
      timeRange: "10:00 AM - 11:00 AM",
      station: "Station 4",
      stationArea: "Main Floor Area",
      clientNotes: "Prefers a conservative finish around the sides.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Suggest Matte Product",
        description:
          "A matte styling paste is likely a useful add-on for this client.",
      },
    }),
  },
  {
    key: "aria-lee",
    title: "Aria Lee",
    subtitle: "Highlights",
    resourceKey: "james",
    year: 2023,
    month: 9,
    day: 10,
    startHour: 13,
    endHour: 15,
    tone: "danger",
    detail: createDetail({
      status: "Pending",
      guest: "Aria Lee",
      membership: "VIP Member",
      visit: "7th Visit",
      service: "Highlights",
      stylist: "James Rodriguez",
      duration: "2 hrs",
      timeRange: "01:00 PM - 03:00 PM",
      station: "Station 6",
      stationArea: "Color Bar",
      clientNotes: "Keep brightness around the face only.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Bond Builder Add-on",
        description:
          "Useful on lightening services to protect hair integrity during lift.",
      },
    }),
  },
  {
    key: "mila-jones",
    title: "Mila Jones",
    subtitle: "Blowout",
    resourceKey: "sophia",
    year: 2023,
    month: 9,
    day: 11,
    startHour: 9,
    endHour: 10,
    tone: "info",
    detail: createDetail({
      status: "Confirmed",
      guest: "Mila Jones",
      membership: "Member",
      visit: "2nd Visit",
      service: "Blowout",
      stylist: "Sophia Chen",
      duration: "1 hr",
      timeRange: "09:00 AM - 10:00 AM",
      station: "Station 7",
      stationArea: "Front Styling Area",
      clientNotes: "Arrives with damp hair after gym sessions.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Add Dry Shampoo Sample",
        description:
          "A product sample may increase retention after this blowout visit.",
      },
    }),
  },
  {
    key: "owen-cole",
    title: "Owen Cole",
    subtitle: "Skin Fade",
    resourceKey: "marcus",
    year: 2023,
    month: 9,
    day: 12,
    startHour: 16,
    endHour: 16.5,
    tone: "success",
    detail: createDetail({
      status: "Confirmed",
      guest: "Owen Cole",
      membership: "Member",
      visit: "3rd Visit",
      service: "Skin Fade",
      stylist: "Marcus Johnson",
      duration: "30 mins",
      timeRange: "04:00 PM - 04:30 PM",
      station: "Station 10",
      stationArea: "Barber Corner",
      clientNotes: "Quick trim before dinner reservation.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Add Styling Powder",
        description:
          "Great low-friction upsell for short hair finishing products.",
      },
    }),
  },
  {
    key: "zoe-diaz",
    title: "Zoe Diaz",
    subtitle: "Color Melt",
    resourceKey: "emma",
    year: 2023,
    month: 9,
    day: 13,
    startHour: 14,
    endHour: 16.5,
    tone: "primary",
    detail: createDetail({
      status: "Confirmed",
      guest: "Zoe Diaz",
      membership: "VIP Member",
      visit: "9th Visit",
      service: "Color Melt",
      stylist: "Emma Watson",
      duration: "2.5 hrs",
      timeRange: "02:00 PM - 04:30 PM",
      station: "Station 4",
      stationArea: "Main Floor Area",
      clientNotes: "Wants a softer transition at the ends.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Gloss Finish",
        description:
          "A gloss service could add shine and improve the final color melt result.",
      },
    }),
  },
  {
    key: "hana-sato",
    title: "Hana Sato",
    subtitle: "Keratin Treatment",
    resourceKey: "sophia",
    year: 2023,
    month: 9,
    day: 3,
    startHour: 10,
    endHour: 13,
    tone: "info",
    detail: createDetail({
      status: "Confirmed",
      guest: "Hana Sato",
      membership: "Member",
      visit: "5th Visit",
      service: "Keratin Treatment",
      stylist: "Sophia Chen",
      duration: "3 hrs",
      timeRange: "10:00 AM - 01:00 PM",
      station: "Station 8",
      stationArea: "Event Styling Area",
      clientNotes: "Need extra timing buffer for processing stage.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Recommend Aftercare Kit",
        description:
          "An aftercare kit is a natural follow-up for smoothing services.",
      },
    }),
  },
  {
    key: "ivy-chen",
    title: "Ivy Chen",
    subtitle: "Balayage",
    resourceKey: "james",
    year: 2023,
    month: 9,
    day: 18,
    startHour: 9,
    endHour: 12,
    tone: "primary",
    detail: createDetail({
      status: "Confirmed",
      guest: "Ivy Chen",
      membership: "VIP Member",
      visit: "10th Visit",
      service: "Balayage",
      stylist: "James Rodriguez",
      duration: "3 hrs",
      timeRange: "09:00 AM - 12:00 PM",
      station: "Station 5",
      stationArea: "Color Bar",
      clientNotes: "Keep brightness concentrated on face-framing pieces.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Bond Repair Treatment",
        description:
          "A high-value add-on for long color sessions and repeat color clients.",
      },
    }),
  },
  {
    key: "max-ryan",
    title: "Max Ryan",
    subtitle: "Hot Towel Shave",
    resourceKey: "marcus",
    year: 2023,
    month: 9,
    day: 20,
    startHour: 11,
    endHour: 11.5,
    tone: "success",
    detail: createDetail({
      status: "Confirmed",
      guest: "Max Ryan",
      membership: "Member",
      visit: "2nd Visit",
      service: "Hot Towel Shave",
      stylist: "Marcus Johnson",
      duration: "30 mins",
      timeRange: "11:00 AM - 11:30 AM",
      station: "Station 9",
      stationArea: "Barber Corner",
      clientNotes: "Prefer close shave, sensitive skin.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Aftershave Balm",
        description:
          "Recommend a soothing balm to support sensitive-skin service outcome.",
      },
    }),
  },
  {
    key: "nina-ford",
    title: "Nina Ford",
    subtitle: "Cut & Style",
    resourceKey: "emma",
    year: 2023,
    month: 9,
    day: 24,
    startHour: 15,
    endHour: 16,
    tone: "danger",
    detail: createDetail({
      status: "Pending",
      guest: "Nina Ford",
      membership: "VIP Member",
      visit: "12th Visit",
      service: "Cut & Style",
      stylist: "Emma Watson",
      duration: "1 hr",
      timeRange: "03:00 PM - 04:00 PM",
      station: "Station 3",
      stationArea: "Main Floor Area",
      clientNotes: "Likes a face-framing fringe and light layers.",
      aiSuggestion: {
        icon: Sparkles,
        title: "Add Styling Finish",
        description:
          "An extra finishing product could improve the visible result on photo day.",
      },
    }),
  },
];

export const dailyStaffSlots = scheduleColumns
  .map((column) => {
    const events = schedulerEvents.filter(
      (event) =>
        event.resourceKey === column.key &&
        event.day === schedulerAnchorDate.day,
    );

    if (events.length === 0) {
      return null;
    }

    return {
      staffKey: column.key,
      startHour: Math.min(...events.map((event) => event.startHour)),
      endHour: Math.max(...events.map((event) => event.endHour)),
      appointmentCount: events.length,
    };
  })
  .filter((slot): slot is NonNullable<typeof slot> => slot !== null);

export const queueRequests: QueueRequest[] = [
  {
    key: "sarah-connor",
    name: "Sarah Connor",
    service: "Walk-in Haircut",
    wait: "15m",
  },
  {
    key: "john-smith",
    name: "John Smith",
    service: "Consultation",
    wait: "5m",
  },
  {
    key: "elena-gilbert",
    name: "Elena Gilbert",
    service: "Quick Trim",
    wait: "22m",
  },
];
