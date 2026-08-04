import type { ScheduleSlot, StaffMember } from "../types/staff.types";

export const staffMembers: StaffMember[] = [
  {
    key: "sarah-jenkins",
    name: "Sarah Jenkins",
    role: "Senior Stylist",
    status: "Active",
    avatarUrl:
      "https://cdn.visily.ai/text2design/images/01837de52a9f0882c2fd1a7e437aec953140b7cf33c98f0c921e6728037101b5.webp",
    shift: "9:00 AM - 5:00 PM",
    station: "Station 1",
  },
  {
    key: "marcus-chen",
    name: "Marcus Chen",
    role: "Colorist",
    status: "Busy",
    avatarUrl:
      "https://cdn.visily.ai/text2design/images/1ad9ee6c66620f82a971daf6fdded160b9767b6787b2b3b1104edd9bf4b80df9.webp",
    shift: "10:00 AM - 6:00 PM",
    station: "Color Bar A",
  },
  {
    key: "elena-rodriguez",
    name: "Elena Rodriguez",
    role: "Junior Stylist",
    status: "Active",
    avatarUrl:
      "https://cdn.visily.ai/text2design/images/ca49b135f19875dad7236f2462e52332c089cf666ad920057a49a5b8e8a5de58.webp",
    shift: "9:00 AM - 2:00 PM",
    station: "Station 4",
  },
  {
    key: "david-kim",
    name: "David Kim",
    role: "Senior Stylist",
    status: "On Leave",
    avatarUrl:
      "https://cdn.visily.ai/text2design/images/c2c8c1ecc4dec5cde231431d19bfb33910b91e5087086f724bbf9b0a794e4758.webp",
  },
];

export const scheduleHours = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export const scheduleSlots: ScheduleSlot[] = [
  {
    staffKey: "sarah-jenkins",
    startHour: 9,
    endHour: 17,
    station: "Station 1",
  },
  {
    staffKey: "marcus-chen",
    startHour: 10,
    endHour: 18,
    station: "Color Bar A",
  },
  {
    staffKey: "elena-rodriguez",
    startHour: 9,
    endHour: 14,
    station: "Station 4",
  },
];
