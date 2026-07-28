export type SuggestionStatus = "pending" | "approved" | "dismissed";
export type MessageChannel = "SMS" | "Push" | "Email";
export type TriggerType =
  | "Upcoming Appointment"
  | "Abandoned Cart"
  | "Long Absence"
  | "Birthday"
  | "Custom";

export interface AISuggestion {
  key: string;
  clientName: string;
  clientAvatar: string;
  matchScore: number;
  trigger: string;
  recommendation: string;
  reasoning: string;
  revenueImpact: string | "Goodwill";
  status: SuggestionStatus;
}

export interface AIStat {
  label: string;
  value: string;
  delta: string;
  deltaLabel: string;
  icon: string;
}

export interface Campaign {
  name: string;
  trigger: TriggerType | "";
  channel: MessageChannel | "";
  messageContent: string;
  aiAutoOptimize: boolean;
}
