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

  // ── Salon / Business profile settings ─────────────────────────

  SALON_SETTING_KEYS: [
    { key: "salon_name",      label: "Salon Name" },
    { key: "salon_business_type", label: "Business Type" },
    { key: "salon_email",     label: "Contact Email" },
    { key: "salon_phone",     label: "Primary Phone" },
    { key: "salon_address",   label: "Physical Address" },
    { key: "salon_timezone",  label: "Salon Timezone" },
  ] as const,

  async getSalonSettings(req: Request, res: Response): Promise<void> {
    const db = req.tenantClient!;
    try {
      const keys = ["salon_name", "salon_business_type", "salon_email", "salon_phone", "salon_address", "salon_timezone"];
      const rows = await db.setting.findMany({
        where: { key: { in: keys } },
      });
      const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
      const data = {
        salonName:     map["salon_name"]      || "",
        businessType:  map["salon_business_type"] || "",
        email:         map["salon_email"]     || "",
        phone:         map["salon_phone"]     || "",
        address:       map["salon_address"]   || "",
        timezone:      map["salon_timezone"]  || "UTC",
      };
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Failed to load salon settings", error);
      res.status(500).json({ success: false, message: "Failed to load salon settings" });
    }
  },

  async updateSalonSettings(req: Request, res: Response): Promise<void> {
    const db = req.tenantClient!;
    const body = req.body as Record<string, string | undefined>;
    const timezone = body.timezone;
    if (!timezone || typeof timezone !== "string") {
      return void res
        .status(400)
        .json({ success: false, message: "timezone is required" });
    }
    try {
      const fieldMap: Record<string, string> = {
        salon_name:          body.salonName   ?? "",
        salon_business_type: body.businessType ?? "",
        salon_email:         body.email       ?? "",
        salon_phone:         body.phone       ?? "",
        salon_address:       body.address     ?? "",
        salon_timezone:      timezone,
      };
      for (const meta of SettingsController.SALON_SETTING_KEYS) {
        const val = fieldMap[meta.key] ?? "";
        await db.setting.upsert({
          where: { key: meta.key },
          update: { value: val, updatedAt: new Date() },
          create: {
            key: meta.key,
            value: val,
            group: "business",
            dataType: "string",
            label: meta.label,
            updatedAt: new Date(),
          },
        });
      }
      const data = {
        salonName:    fieldMap["salon_name"],
        businessType: fieldMap["salon_business_type"],
        email:        fieldMap["salon_email"],
        phone:        fieldMap["salon_phone"],
        address:      fieldMap["salon_address"],
        timezone:     fieldMap["salon_timezone"],
      };
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Failed to update salon settings", error);
      res.status(500).json({ success: false, message: "Failed to update salon settings" });
    }
  },

  // ── System logs (read-only, immutable audit trail) ─────────────

  async getSystemLogs(req: Request, res: Response): Promise<void> {
    const db = req.tenantClient!;
    try {
      const pageRaw = Number.parseInt(String(req.query.page ?? "1"), 10);
      const pageSizeRaw = Number.parseInt(String(req.query.pageSize ?? "25"), 10);
      const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
      const pageSize =
        Number.isFinite(pageSizeRaw) && pageSizeRaw > 0 && pageSizeRaw <= 100
          ? pageSizeRaw
          : 25;

      const entityType =
        typeof req.query.entityType === "string" && req.query.entityType.trim()
          ? req.query.entityType.trim()
          : undefined;
      const search =
        typeof req.query.search === "string" && req.query.search.trim()
          ? req.query.search.trim()
          : undefined;
      const startDate =
        typeof req.query.startDate === "string" ? new Date(req.query.startDate) : undefined;
      const endDate =
        typeof req.query.endDate === "string" ? new Date(req.query.endDate) : undefined;

      const where = {
        ...(entityType ? { entityType } : {}),
        ...(search
          ? {
              OR: [
                { action: { contains: search } },
                { performedBy: { contains: search } },
              ],
            }
          : {}),
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate && !Number.isNaN(startDate.getTime()) ? { gte: startDate } : {}),
                ...(endDate && !Number.isNaN(endDate.getTime()) ? { lte: endDate } : {}),
              },
            }
          : {}),
      };

      const [total, rows] = await Promise.all([
        db.auditlog.count({ where }),
        db.auditlog.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
      ]);

      const data = rows.map((row) => {
        let details: Record<string, unknown> = {};
        try {
          details = row.newValues ? JSON.parse(row.newValues) : {};
        } catch {
          details = {};
        }
        return {
          id: row.id,
          action: row.action,
          entityType: row.entityType,
          entityId: row.entityId,
          performedBy: row.performedBy,
          ipAddress: row.ipAddress,
          requestBody: row.oldValues,
          method: (details.method as string) ?? null,
          path: (details.path as string) ?? null,
          statusCode: (details.statusCode as number) ?? null,
          durationMs: (details.durationMs as number) ?? null,
          success: (details.success as boolean) ?? null,
          createdAt: row.createdAt.toISOString(),
        };
      });

      res.status(200).json({
        success: true,
        data,
        pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
      });
    } catch (error) {
      console.error("Failed to load system logs", error);
      res.status(500).json({ success: false, message: "Failed to load system logs" });
    }
  },
};
