export type StaffRole =
  | "Senior Stylist"
  | "Color Specialist"
  | "Nail Technician"
  | "Front Desk"
  | "Junior Stylist";

export type StaffStatus = "On Shift" | "Off Shift" | "Break";

export type StaffMember = {
  key: string;
  name: string;
  role: StaffRole;
  status: StaffStatus;
  phone: string;
  email: string;
  joinedAt: string;
  station: string;
  shift: string;
  utilizationRate: number;
  averageTicket: number;
  monthlyRevenue: number;
  appointmentsCompleted: number;
  cancellationRate: number;
  topServices: string[];
  certifications: string[];
  note: string;
};

export type StaffSummaryMetric = {
  key: string;
  label: string;
  value: string;
  hint: string;
};
