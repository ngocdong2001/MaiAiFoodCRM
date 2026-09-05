"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  settingsService,
  type SystemLogItem,
} from "../../services/settings.service";

const PAGE_SIZE = 20;

const GENERIC_VERB_KEY: Record<string, string> = {
  create: "generic.create",
  update: "generic.update",
  delete: "generic.delete",
};

// Loopback addresses shown to non-technical users with a friendly suffix.
const formatIpAddress = (ip: string | null) => {
  if (!ip) return "—";
  if (ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") {
    return "127.0.0.1 (localhost)";
  }
  return ip.replace("::ffff:", "");
};

const SystemLogsSection = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<SystemLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Turns a stored action key (e.g. "calendar.cancelAppointment" or
  // "generic.create.staff") into a human-readable, localized label.
  const translateAction = (action: string): string => {
    const specificKey = `dashboard.settings.systemLogs.actions.${action}`;
    const specific = t(specificKey, { defaultValue: "" });
    if (specific) return specific;

    if (action.startsWith("generic.")) {
      const [, verb, resource] = action.split(".");
      const verbLabel = t(GENERIC_VERB_KEY[verb] ?? "generic.update", {
        defaultValue: verb,
      });
      const resourceLabel = t(`dashboard.settings.systemLogs.resources.${resource}`, {
        defaultValue: resource,
      });
      return `${verbLabel} ${resourceLabel}`;
    }

    return action;
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    settingsService
      .getSystemLogs({ page, pageSize: PAGE_SIZE, search: search || undefined })
      .then((res) => {
        if (cancelled) return;
        setLogs(res.data);
        setTotalPages(res.pagination.totalPages || 1);
      })
      .catch(() => {
        if (!cancelled) setError(t("dashboard.settings.systemLogs.loadError"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, search, t]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#171A21]">
        {t("dashboard.settings.systemLogs.title")}
      </h2>
      <p className="mt-1 text-sm text-[#8D95A5]">
        {t("dashboard.settings.systemLogs.description")}
      </p>

      <div className="mt-6 rounded-[14px] border border-[#DEE1E7] bg-white shadow-[0px_2px_4px_0px_#00000012]">
        <div className="flex items-center justify-between gap-4 border-b border-[#DEE1E7] px-6 py-4">
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("dashboard.settings.systemLogs.searchPlaceholder")}
            className="w-full max-w-xs rounded-[10px] border border-[#DEE1E7] px-3 py-2 text-sm text-[#171A21] shadow-[0px_2px_4px_0px_#00000012] outline-none focus:border-primary"
          />
        </div>

        {isLoading ? (
          <p className="px-6 py-6 text-sm text-[#8D95A5]">
            {t("dashboard.settings.systemLogs.loading")}
          </p>
        ) : error ? (
          <p className="px-6 py-6 text-sm text-destructive">{error}</p>
        ) : logs.length === 0 ? (
          <p className="px-6 py-6 text-sm text-[#8D95A5]">
            {t("dashboard.settings.systemLogs.empty")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-180">
              <thead>
                <tr className="border-b border-[#DEE1E7] text-left text-[13px] font-medium text-[#8D95A5]">
                  <th className="px-6 py-2">
                    {t("dashboard.settings.systemLogs.col.time")}
                  </th>
                  <th className="px-4 py-2">
                    {t("dashboard.settings.systemLogs.col.action")}
                  </th>
                  <th className="px-4 py-2">
                    {t("dashboard.settings.systemLogs.col.user")}
                  </th>
                  <th className="px-4 py-2">
                    {t("dashboard.settings.systemLogs.col.status")}
                  </th>
                  <th className="px-4 py-2">
                    {t("dashboard.settings.systemLogs.col.ip")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF0F3]">
                {logs.map((log) => (
                  <Fragment key={log.id}>
                    <tr
                      className="cursor-pointer hover:bg-[#FAFAFA]"
                      onClick={() =>
                        setExpandedId(expandedId === log.id ? null : log.id)
                      }
                    >
                      <td className="whitespace-nowrap px-6 py-3 text-sm text-[#171A21]">
                        {new Date(log.createdAt).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#171A21]">
                        {translateAction(log.action)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#171A21]">
                        {log.performedBy}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={
                            log.success === false
                              ? "rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                              : "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                          }
                        >
                          {log.statusCode ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#8D95A5]">
                        {formatIpAddress(log.ipAddress)}
                      </td>
                    </tr>
                    {expandedId === log.id && (
                      <tr>
                        <td colSpan={5} className="bg-[#FAFAFA] px-6 py-3">
                          <div className="grid grid-cols-2 gap-2 text-xs text-[#4B5563]">
                            <p>
                              <span className="font-medium">
                                {t("dashboard.settings.systemLogs.col.entity")}:
                              </span>{" "}
                              {log.entityType}
                              {log.entityId ? ` #${log.entityId}` : ""}
                            </p>
                            <p>
                              <span className="font-medium">
                                {t("dashboard.settings.systemLogs.col.path")}:
                              </span>{" "}
                              {log.method} {log.path}
                            </p>
                            <p>
                              <span className="font-medium">
                                {t("dashboard.settings.systemLogs.col.duration")}:
                              </span>{" "}
                              {log.durationMs != null ? `${log.durationMs}ms` : "—"}
                            </p>
                            {log.requestBody && (
                              <p className="col-span-2 break-all">
                                <span className="font-medium">
                                  {t("dashboard.settings.systemLogs.col.payload")}:
                                </span>{" "}
                                {log.requestBody}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[#DEE1E7] bg-[#F3F4F7]/30 px-6 py-3">
          <span className="text-xs text-[#8D95A5]">
            {t("dashboard.settings.systemLogs.pageLabel", { page, totalPages })}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-[8px] border border-[#DEE1E7] px-3 py-1.5 text-sm text-[#171A21] disabled:opacity-40"
            >
              {t("dashboard.settings.systemLogs.prev")}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-[8px] border border-[#DEE1E7] px-3 py-1.5 text-sm text-[#171A21] disabled:opacity-40"
            >
              {t("dashboard.settings.systemLogs.next")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogsSection;
