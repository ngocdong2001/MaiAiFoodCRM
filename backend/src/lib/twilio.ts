import twilio from "twilio";

// ── Environment variables ────────────────────────────────────────────────
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || "";

// ── Singleton client ─────────────────────────────────────────────────────
let client: twilio.Twilio | null = null;

function getClient(): twilio.Twilio | null {
  if (client) return client;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.warn("[Twilio] Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN — SMS disabled");
    return null;
  }
  client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return client;
}

// ── Normalize phone to E.164 (US default +1) ─────────────────────────────
function normalizePhone(phone: string, countryCode = "+1"): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.startsWith("1") && digits.length >= 11) {
    return `+${digits}`;
  }
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  return `${countryCode}${digits}`;
}

// ── Send SMS ─────────────────────────────────────────────────────────────
export async function sendSms(to: string, body: string): Promise<boolean> {
  const twilioClient = getClient();
  if (!twilioClient) return false;
  if (!TWILIO_PHONE_NUMBER) {
    console.warn("[Twilio] Missing TWILIO_PHONE_NUMBER — SMS not sent");
    return false;
  }

  try {
    const normalizedTo = normalizePhone(to);
    await twilioClient.messages.create({
      body,
      from: TWILIO_PHONE_NUMBER,
      to: normalizedTo,
    });
    console.log(`[Twilio] SMS sent to ${normalizedTo}`);
    return true;
  } catch (err) {
    console.error("[Twilio] Failed to send SMS:", err);
    return false;
  }
}

// ── Appointment confirmation SMS ─────────────────────────────────────────
export interface AppointmentSmsData {
  guestName: string;
  guestPhone: string | null;
  services: string[];
  startTime: Date | string;
  endTime: Date | string;
}

export async function sendAppointmentConfirmation(
  data: AppointmentSmsData,
): Promise<boolean> {
  if (!data.guestPhone) {
    console.warn("[Twilio] Guest has no phone number — skipping SMS");
    return false;
  }

  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

  const serviceList = data.services.join(", ");

  const message = [
    `Hi ${data.guestName}!`,
    ``,
    `Your appointment at MAIAI has been confirmed:`,
    `📅 ${formatDate(start)}`,
    `⏰ ${formatTime(start)} - ${formatTime(end)}`,
    `💇 Service: ${serviceList}`,
    ``,
    `To cancel, please call our hotline.`,
    `Thank you for choosing MAIAI! 💖`,
  ].join("\n");

  return sendSms(data.guestPhone, message);
}
