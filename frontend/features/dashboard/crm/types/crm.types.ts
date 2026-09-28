export type GuestSegment = "All" | "VIP" | "Loyal" | "At Risk";

export type GuestTag = {
  id: number;
  name: string;
  color: string | null;
};

export type GuestNote = {
  id: number;
  content: string;
  author: string | null;
  isPinned: boolean;
  createdAt: string;
};

export type GuestCard = {
  id: number;
  key: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  roleTag: string;
  listMeta: string;
  segment: Exclude<GuestSegment, "All">;
  noShows: number;
  clientSince: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpend: number;
  smsConsent: boolean;
  lastVisit: string | null;
  nextAppointment: string | null;
  notes: string | null;
  tags: GuestTag[];
  guestNotes: GuestNote[];
  activities: GuestActivity[];
};

export type GuestActivity = {
  id: number;
  type: "visit";
  title: string;
  amount: number;
  date: string;
  technician: string;
  status: string;
};

export type GuestFormValues = {
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  gender: string;
  dateOfBirth: string;
  loyaltyPoints: string;
  smsConsent: boolean;
  notes: string;
  tagIds: number[];
};