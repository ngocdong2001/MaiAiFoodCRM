import type { AIStat, AISuggestion, Campaign } from "../types/ai-recs.types";

export const aiStats: AIStat[] = [
  {
    label: "AI Revenue (MTD)",
    value: "$4,250",
    delta: "+15%",
    deltaLabel: "vs last period",
    icon: "trending-up",
  },
  {
    label: "Active Campaigns",
    value: "12",
    delta: "3 ending soon",
    deltaLabel: "vs last period",
    icon: "message-square",
  },
  {
    label: "Pending Suggestions",
    value: "24",
    delta: "+8 today",
    deltaLabel: "vs last period",
    icon: "sparkles",
  },
  {
    label: "Conversion Rate",
    value: "38%",
    delta: "+2.4%",
    deltaLabel: "vs last period",
    icon: "users",
  },
];

export const aiSuggestions: AISuggestion[] = [
  {
    key: "emma-thompson",
    clientName: "Emma Thompson",
    clientAvatar:
      "https://cdn.visily.ai/text2design/images/972e6fa07fdab6f4891233eb27513463dc6121372beb86ee19a9ddfb4892a0a6.webp",
    matchScore: 92,
    trigger: "Upcoming Balayage Appt",
    recommendation: "Upsell Olaplex Treatment",
    reasoning:
      "Client has history of color damage; hasn't booked a treatment in 6 months.",
    revenueImpact: "+$45",
    status: "pending",
  },
  {
    key: "marcus-chen",
    clientName: "Marcus Chen",
    clientAvatar:
      "https://cdn.visily.ai/text2design/images/eba804e685493e5ac097613a69e15d54b548b23a6bd72d42af31da0eed9226ad.webp",
    matchScore: 85,
    trigger: "Abandoned Cart (Retail)",
    recommendation: "Offer 10% Off Styling Clay",
    reasoning:
      "Added product to cart during last visit but didn't purchase. High engagement with retail emails.",
    revenueImpact: "+$28",
    status: "pending",
  },
  {
    key: "sarah-jenkins",
    clientName: "Sarah Jenkins",
    clientAvatar:
      "https://cdn.visily.ai/text2design/images/458eb3a63ce6438f212b5ecc1e57e62995521c570dc21995728a4c9fce84e354.webp",
    matchScore: 78,
    trigger: "6-Week Absence",
    recommendation: "Re-engagement Discount",
    reasoning:
      "Usually books every 4 weeks for root touch-up. Currently 2 weeks overdue.",
    revenueImpact: "+$85",
    status: "pending",
  },
  {
    key: "david-miller",
    clientName: "David Miller",
    clientAvatar:
      "https://cdn.visily.ai/text2design/images/e3c426752a569eb6569edf31bac56620e87d867826992e133f0132984c30d54b.webp",
    matchScore: 99,
    trigger: "Birthday Tomorrow",
    recommendation: "Free Conditioning Upgrade",
    reasoning: "Automated birthday sequence. High lifetime value client.",
    revenueImpact: "Goodwill",
    status: "pending",
  },
];

export const defaultCampaign: Campaign = {
  name: "Olaplex Upsell - Balayage Clients",
  trigger: "Upcoming Appointment",
  channel: "SMS",
  messageContent:
    "Hi {ClientName}! 👋 We can't wait for your {ServiceName} appointment tomorrow. We noticed it's been a while since your last deep conditioning treatment. Want to add an Olaplex Standalone Treatment to protect your color?",
  aiAutoOptimize: true,
};
