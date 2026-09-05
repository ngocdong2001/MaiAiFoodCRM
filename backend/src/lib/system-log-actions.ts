import type { Request } from "express";

/**
 * Resolves a stable, translatable action key (e.g. "calendar.cancelAppointment")
 * for a given request. The key itself is stored in the immutable log; the
 * human-readable EN/VI label is looked up on the frontend at display time.
 */
export function resolveActionKey(req: Request): string {
  const method = req.method;
  // Strip "/api" prefix and query string; keep raw path segments.
  const segments = req.path.split("/").filter(Boolean).filter((s) => s !== "api");
  const [resource, sub1, sub2, sub3] = segments;
  const status = typeof req.body?.status === "string" ? req.body.status : undefined;

  switch (resource) {
    case "calendar": {
      if (sub1 === "appointments") {
        if (!sub2) {
          if (method === "POST") return "calendar.createAppointment";
        } else if (sub3 === "status") {
          switch (status) {
            case "cancelled":
              return "calendar.cancelAppointment";
            case "completed":
              return "calendar.completeAppointment";
            case "confirmed":
              return "calendar.confirmAppointment";
            case "in_progress":
              return "calendar.startAppointment";
            case "pending":
              return "calendar.restoreAppointment";
            default:
              return "calendar.updateAppointmentStatus";
          }
        } else if (method === "PUT") {
          return "calendar.updateAppointment";
        } else if (method === "DELETE") {
          return "calendar.deleteAppointment";
        }
      }
      break;
    }
    case "revenue": {
      if (sub1 === "record" && sub3 === "restore") return "revenue.restoreBooking";
      if (sub1 === "record" && sub3 === "cancel-reason") return "revenue.updateCancelReason";
      break;
    }
    case "crm": {
      if (sub1 === "guests") {
        if (!sub2 && method === "POST") return "crm.createGuest";
        if (sub2 && sub3 === "notes") return "crm.updateGuestNotes";
        if (sub2 && method === "PUT") return "crm.updateGuest";
        if (sub2 && method === "DELETE") return "crm.deleteGuest";
      }
      break;
    }
    case "staff": {
      if (!sub1 && method === "POST") return "staff.createStaff";
      if (sub1 && method === "PUT") return "staff.updateStaff";
      if (sub1 && method === "DELETE") return "staff.deleteStaff";
      break;
    }
    case "services": {
      if (sub1 === "categories") {
        if (!sub2 && method === "POST") return "service.createCategory";
        if (sub2 && method === "PUT") return "service.updateCategory";
        if (sub2 && method === "DELETE") return "service.deleteCategory";
      } else if (sub1 === "bulk" && method === "PUT") {
        return "service.bulkSave";
      } else if (sub1 === "active") {
        return "service.toggleActive";
      } else if (!sub1 && method === "POST") {
        return "service.createService";
      } else if (sub1 && sub2 === "active") {
        return "service.toggleActive";
      } else if (sub1 && method === "PUT") {
        return "service.updateService";
      } else if (sub1 && method === "DELETE") {
        return "service.deleteService";
      }
      break;
    }
    case "settings": {
      if (sub1 === "operating-hours") return "settings.updateOperatingHours";
      if (sub1 === "salon") return "settings.updateSalonSettings";
      break;
    }
    case "auth": {
      if (sub1 === "me") return "auth.updateProfile";
      break;
    }
    default:
      break;
  }

  // Fallback: generic method + resource key, still translatable with a
  // parameterized label ("Updated staff", "Deleted revenue", ...).
  const methodKey =
    method === "POST"
      ? "create"
      : method === "DELETE"
        ? "delete"
        : method === "PATCH"
          ? "update"
          : "update";
  return `generic.${methodKey}.${resource ?? "unknown"}`;
}
