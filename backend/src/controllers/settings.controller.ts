import type { Request, Response } from "express";

type DayHours = { day: string; open: boolean; from: string; to: string };

const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_OPERATING_HOURS: DayHours[] = DAY_NAMES.map((day) => ({
  day,
  open: day !== "Sunday",
  from: "09:00",
  to: "18:00",
}));

const isValidTime = (value: unknown): value is string =>
  typeof value === "string" && /^\d{2}:\d{2}$/.test(value);

const validateHours = (body: unknown): DayHours[] | null => {
  if (!Array.isArray(body) || body.length !== 7) return null;
  for (const item of body) {
    if (
      typeof item?.day !== "string" ||
      typeof item?.open !== "boolean" ||
      !isValidTime(item?.from) ||
      !isValidTime(item?.to)
    )
      return null;
  }
  return body as DayHours[];
};

export const SettingsController = {
  async getOperatingHours(req: Request, res: Response): Promise<void> {
    const db = req.tenantClient!;
    try {
      const setting = await db.setting.findUnique({
        where: { key: "operating_hours" },
      });
      let hours: DayHours[] = DEFAULT_OPERATING_HOURS;
      if (setting?.value) {
        try {
          hours = JSON.parse(setting.value) as DayHours[];
        } catch {
          /* use default */
        }
      }
      res.status(200).json({ success: true, data: hours });
    } catch (error) {
      console.error("Failed to load operating hours", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to load operating hours" });
    }
  },

  async updateOperatingHours(req: Request, res: Response): Promise<void> {
    const db = req.tenantClient!;
    const hours = validateHours(req.body);
    if (!hours)
      return void res
        .status(400)
        .json({ success: false, message: "Invalid operating hours format" });
    try {
      await db.setting.upsert({
        where: { key: "operating_hours" },
        update: { value: JSON.stringify(hours), updatedAt: new Date() },
        create: {
          key: "operating_hours",
          value: JSON.stringify(hours),
          group: "business",
          dataType: "json",
          label: "Operating Hours",
          updatedAt: new Date(),
        },
      });
      res.status(200).json({ success: true, data: hours });
    } catch (error) {
      console.error("Failed to update operating hours", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to update operating hours" });
    }
  },
};
