export type RevenueMetric = {
  key: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
};

export type StaffRevenueRow = {
  key: string;
  staffName: string;
  services: number;
  tips: string;
  totalRevenue: string;
  avatarUrl: string;
};

export type PaymentMethodItem = {
  key: string;
  label: string;
  amount: string;
  color: string;
};

export type RevenueActivity = {
  key: string;
  title: string;
  subtitle: string;
  amount: string;
  time: string;
};

export const dailyRevenueMetrics: RevenueMetric[] = [
  {
    key: "total-daily-revenue",
    label: "Total Daily Revenue",
    value: "$12,450",
    delta: "+15.4%",
    trend: "up",
  },
  {
    key: "service-revenue",
    label: "Service Revenue",
    value: "$10,200",
    delta: "+12.1%",
    trend: "up",
  },
  {
    key: "product-revenue",
    label: "Product Revenue",
    value: "$2,250",
    delta: "-2.4%",
    trend: "down",
  },
  {
    key: "total-orders",
    label: "Total Orders",
    value: "42",
    delta: "+8.2%",
    trend: "up",
  },
];

export const staffRevenueRows: StaffRevenueRow[] = [
  {
    key: "emma",
    staffName: "Emma Watson",
    services: 12,
    tips: "$450",
    totalRevenue: "$4,200",
    avatarUrl:
      "https://cdn.visily.ai/text2design/agentic-codegen-output/images/1df13a07-bfae-4161-910e-1ba02692b49d.webp",
  },
  {
    key: "james",
    staffName: "James Rodriguez",
    services: 9,
    tips: "$320",
    totalRevenue: "$3,850",
    avatarUrl:
      "https://cdn.visily.ai/text2design/agentic-codegen-output/images/05700ff1-710c-4e58-9ac7-ff8fa30660bb.webp",
  },
  {
    key: "sophia",
    staffName: "Sophia Chen",
    services: 11,
    tips: "$280",
    totalRevenue: "$2,150",
    avatarUrl:
      "https://cdn.visily.ai/text2design/agentic-codegen-output/images/c10d42d4-7e9d-4424-9db1-aa83ead76e6c.webp",
  },
  {
    key: "marcus",
    staffName: "Marcus Johnson",
    services: 6,
    tips: "$150",
    totalRevenue: "$1,250",
    avatarUrl:
      "https://cdn.visily.ai/text2design/images/54d091efb71e3f93785bead0499f4c3709adf57976e7c7a675afd645b13fa98d.webp",
  },
  {
    key: "elena",
    staffName: "Elena Gilbert",
    services: 4,
    tips: "$100",
    totalRevenue: "$1,000",
    avatarUrl:
      "https://cdn.visily.ai/text2design/images/2849a8c214643b5939440013ebcf351c6a210a4a47359e804b5f49bd5774f409.webp",
  },
];

export const paymentMethods: PaymentMethodItem[] = [
  { key: "cash", label: "Cash", amount: "$5,400", color: "#F04CAC" },
  {
    key: "transfer",
    label: "Bank Transfer",
    amount: "$6,050",
    color: "#00CBC3",
  },
  { key: "card", label: "Card (POS)", amount: "$1,000", color: "#EEBC4A" },
];

export const recentRevenueActivities: RevenueActivity[] = [
  {
    key: "walkin-1",
    title: "Walk-in Guest",
    subtitle: "Payment for Haircut & Wash",
    amount: "+$350",
    time: "10:15 AM",
  },
  {
    key: "olivia",
    title: "Olivia Pope",
    subtitle: "Payment for Balayage & Cut",
    amount: "+$1,200",
    time: "09:45 AM",
  },
  {
    key: "walkin-2",
    title: "Walk-in Guest",
    subtitle: "Purchased Olaplex No.4 Shampoo",
    amount: "+$650",
    time: "09:20 AM",
  },
];
