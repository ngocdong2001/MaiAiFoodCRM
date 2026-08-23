/**
 * Weekly schedule helpers
 * Resolve staff schedule from date + weekly template + overrides
 */

export type WeeklyScheduleDay = {
  active: boolean;
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  breakStart?: string | null; // HH:MM
  breakEnd?: string | null; // HH:MM
  station?: string | null;
};

export type WeeklySchedule = {
  monday: WeeklyScheduleDay;
  tuesday: WeeklyScheduleDay;
  wednesday: WeeklyScheduleDay;
  thursday: WeeklyScheduleDay;
  friday: WeeklyScheduleDay;
  saturday: WeeklyScheduleDay;
  sunday: WeeklyScheduleDay;
};

export type DaySchedule = {
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
  station: string | null;
};

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
const DAY_NAMES = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Get day name from date string (YYYY-MM-DD)
 * Returns lowercase: "monday", "tuesday", ..., "sunday"
 */
export function dayNameFromDateStr(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  return DAYS[d.getUTCDay()];
}

/**
 * Validate weekly schedule structure
 * Returns null if valid, otherwise error message
 */
export function validateWeeklySchedule(weekly: any): string | null {
  if (!weekly || typeof weekly !== "object") {
    return "Weekly schedule must be an object";
  }

  for (const day of DAY_NAMES) {
    const cfg = weekly[day];
    if (!cfg) return `Missing config for ${day}`;

    if (typeof cfg.active !== "boolean") {
      return `${day}.active must be boolean`;
    }

    if (!cfg.active) continue; // day off OK

    // Validate times
    if (!TIME_PATTERN.test(cfg.startTime)) {
      return `${day}.startTime invalid format (expected HH:MM)`;
    }
    if (!TIME_PATTERN.test(cfg.endTime)) {
      return `${day}.endTime invalid format (expected HH:MM)`;
    }

    // startTime < endTime
    if (cfg.startTime >= cfg.endTime) {
      return `${day}: endTime must be after startTime`;
    }

    // Break validation
    if ((cfg.breakStart && !cfg.breakEnd) || (!cfg.breakStart && cfg.breakEnd)) {
      return `${day}: breakStart and breakEnd must both exist or both null`;
    }

    if (cfg.breakStart && cfg.breakEnd) {
      if (!TIME_PATTERN.test(cfg.breakStart)) {
        return `${day}.breakStart invalid format (expected HH:MM)`;
      }
      if (!TIME_PATTERN.test(cfg.breakEnd)) {
        return `${day}.breakEnd invalid format (expected HH:MM)`;
      }

      if (cfg.breakStart >= cfg.breakEnd) {
        return `${day}: breakEnd must be after breakStart`;
      }

      if (cfg.breakStart < cfg.startTime || cfg.breakEnd > cfg.endTime) {
        return `${day}: break must be within shift (${cfg.startTime}–${cfg.endTime})`;
      }
    }

    // Station is optional
    if (cfg.station && typeof cfg.station !== "string") {
      return `${day}.station must be string`;
    }
  }

  return null;
}

/**
 * Resolve day schedule from weekly template
 * Returns null if day is off or no template exists
 */
export function resolveDayScheduleFromWeekly(weekly: WeeklySchedule | null | undefined, dateStr: string): DaySchedule | null {
  if (!weekly || typeof weekly !== "object") {
    return null;
  }

  const dayName = dayNameFromDateStr(dateStr) as keyof WeeklySchedule;
  const dayConfig = weekly[dayName];

  if (!dayConfig || !dayConfig.active) {
    return null;
  }

  return {
    startTime: dayConfig.startTime || "09:00",
    endTime: dayConfig.endTime || "17:00",
    breakStart: dayConfig.breakStart || null,
    breakEnd: dayConfig.breakEnd || null,
    station: dayConfig.station || null,
  };
}

/**
 * Generate default weekly schedule
 * Mon–Fri 09:00–17:00, 12:00–13:00 break, Sat–Sun off
 */
export function getDefaultWeeklySchedule(): WeeklySchedule {
  const workday: WeeklyScheduleDay = {
    active: true,
    startTime: "09:00",
    endTime: "17:00",
    breakStart: "12:00",
    breakEnd: "13:00",
    station: null,
  };

  const dayoff: WeeklyScheduleDay = {
    active: false,
  };

  return {
    monday: workday,
    tuesday: workday,
    wednesday: workday,
    thursday: workday,
    friday: workday,
    saturday: dayoff,
    sunday: dayoff,
  };
}
