export type GuestSegment = "All" | "VIP" | "Loyal" | "At Risk";

export type GuestCard = {
  key: string;
  name: string;
  email: string;
  phone: string;
  roleTag: string;
  listMeta: string;
  segment: Exclude<GuestSegment, "All">;
  noShows: number;
  clientSince: string;
  ytdDelta: string;
  preferredServices: string[];
  preferences: string[];
  baseColor: string;
  toner: string;
  address: string;
  city: string;
  birthday: string;
  preferredTechnician: string;
  loyaltyPoints: number;
  totalVisits: number;
  lifetimeSpend: number;
  lastVisit: string;
  nextAppointment?: string;
  notes: string;
};

export type GuestActivity = {
  key: string;
  guestKey: string;
  type: "visit" | "note" | "campaign" | "message";
  title: string;
  amount: number;
  date: string;
  technician: string;
};
