import type { LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  key: string;
  label: string;
  href: string;
};

export type StatCardData = {
  key: string;
  label: string;
  value: string;
  hint: string;
  hintTone: "positive" | "muted";
  icon: LucideIcon;
};

export type QueueGuest = {
  key: string;
  name: string;
  service: string;
  status: string;
  urgent: boolean;
};

export type SnapshotItem = {
  key: string;
  time: string;
  title: string;
  assignee?: string;
};

export type RecentGuest = {
  key: string;
  name: string;
  meta: string;
};

export type Recommendation = {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type PlaceholderRoute = {
  key: string;
  title: string;
  description: string;
  icon: LucideIcon;
};