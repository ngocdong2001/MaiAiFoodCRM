"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import ConfirmDialog from "@/shared/components/molecules/ConfirmDialog";
import QueryErrorState from "@/shared/components/molecules/QueryErrorState";
import { getApiErrorMessage } from "@/shared/lib/apiError";

import ServiceCategoryDialog from "../components/ServiceCategoryDialog";
import ServicePriceTableSection from "../components/sections/ServicePriceTableSection";
import ServiceSummarySection from "../components/sections/ServiceSummarySection";
import ServiceToolbarSection from "../components/sections/ServiceToolbarSection";
import {
  useBulkSaveServices,
  useServiceCategories,
  useServiceList,
} from "../hooks/useServices";
import type {
  ServiceDraftRow,
  ServiceItem,
  ServiceStatusFilter,
} from "../types/service.types";

const toDraftRow = (service: ServiceItem): ServiceDraftRow => ({
  key: `service-${service.id}`,
  id: service.id,
  name: service.name,
  categoryId: service.categoryId,
  durationMinutes: String(service.durationMinutes),
  price: String(service.price),
  isActive: service.isActive,
  description: service.description,
  imageUrl: service.imageUrl,
});

const signature = (rows: ServiceDraftRow[]) =>
  JSON.stringify(
    rows.map((row) => [
      row.id,
      row.name,
      row.categoryId,
      row.durationMinutes,
      row.price,
      row.isActive,
    ]),
  );

const getApiError = getApiErrorMessage;

const ServicesPage = () => {
  const { t, i18n } = useTranslation();
  const servicesQuery = useServiceList();
  const categoriesQuery = useServiceCategories();
  const bulkSave = useBulkSaveServices();

  const [rows, setRows] = useState<ServiceDraftRow[]>([]);
  const [syncedServices, setSyncedServices] = useState<ServiceItem[]>([]);
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | number>("all");
  const [statusFilter, setStatusFilter] = useState<ServiceStatusFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);
  const newRowCounter = useRef(0);

  const services = useMemo(
    () => servicesQuery.data ?? [],
    [servicesQuery.data],
  );
  const categories = categoriesQuery.data ?? [];

  const lastUpdatedLabel = useMemo(() => {
    const latest = services.reduce(
      (max, service) => Math.max(max, new Date(service.updatedAt).getTime()),
      0,
    );
    if (!latest) return t("dashboard.services.summary.noData");

    const locale = i18n.language === "en" ? "en-US" : "vi-VN";
    const date = new Date(latest);
    const time = date.toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
    return date.toDateString() === new Date().toDateString()
      ? t("dashboard.services.summary.today", { time })
      : t("dashboard.services.summary.onDate", {
          date: date.toLocaleDateString(locale),
          time,
        });
  }, [services, t, i18n.language]);

  // Reload the draft whenever fresh rows arrive from the database.
  if (syncedServices !== services) {
    setSyncedServices(services);
    setRows(services.map(toDraftRow));
    setRemovedIds([]);
  }

  const baseline = useMemo(
    () => signature(services.map(toDraftRow)),
    [services],
  );
  // Blank draft rows (no name yet) don't count as a real change, so they never
  // trigger autosave/refetch while the user is still filling them in.
  const meaningfulRows = rows.filter(
    (row) => row.id !== null || row.name.trim(),
  );
  const meaningfulSignature = signature(meaningfulRows);
  const isDirty = meaningfulSignature !== baseline || removedIds.length > 0;

  const visibleRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (row.id === null) return true;
      if (keyword && !row.name.toLowerCase().includes(keyword)) return false;
      if (categoryFilter !== "all" && row.categoryId !== categoryFilter)
        return false;
      if (statusFilter === "active" && !row.isActive) return false;
      if (statusFilter === "inactive" && row.isActive) return false;
      return true;
    });
  }, [rows, query, categoryFilter, statusFilter]);

  const changeRow = (key: string, patch: Partial<ServiceDraftRow>) => {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    newRowCounter.current += 1;
    setRows((current) => [
      ...current,
      {
        key: `new-${newRowCounter.current}`,
        id: null,
        name: "",
        categoryId:
          categoryFilter !== "all"
            ? categoryFilter
            : (categories[0]?.id ?? null),
        durationMinutes: "30",
        price: "0",
        isActive: true,
        description: null,
        imageUrl: null,
      },
    ]);
  };

  const removeRow = (key: string) => {
    const target = rows.find((row) => row.key === key);
    if (!target) return;
    if (target.id)
      setRemovedIds((current) => [...current, target.id as number]);
    setRows((current) => current.filter((row) => row.key !== key));
  };

  const resetDraft = () => {
    setRows(services.map(toDraftRow));
    setRemovedIds([]);
    setError(null);
    setPendingReset(false);
  };

  const save = async () => {
    // Filter out rows with empty names (silently skip them)
    const validRows = rows.filter((row) => row.name.trim());

    for (const [index, row] of validRows.entries()) {
      if (!row.categoryId) {
        setError(
          t("dashboard.services.errors.rowCategory", { row: index + 1 }),
        );
        return;
      }
      if (!Number(row.durationMinutes) || Number(row.durationMinutes) <= 0) {
        setError(
          t("dashboard.services.errors.rowDuration", { row: index + 1 }),
        );
        return;
      }
      if (Number(row.price) < 0 || Number.isNaN(Number(row.price))) {
        setError(t("dashboard.services.errors.rowPrice", { row: index + 1 }));
        return;
      }
    }

    setError(null);
    try {
      await bulkSave.mutateAsync({
        upserts: validRows.map((row, index) => ({
          ...(row.id ? { id: row.id } : {}),
          name: row.name.trim(),
          description: row.description,
          price: Number(row.price),
          durationMinutes: Number(row.durationMinutes),
          categoryId: row.categoryId as number,
          imageUrl: row.imageUrl,
          isActive: row.isActive,
          sortOrder: index + 1,
        })),
        deleteIds: removedIds,
      });
      setRemovedIds([]);
    } catch (saveError) {
      setError(
        getApiError(saveError, t("dashboard.services.errors.saveFailed")),
      );
    }
  };

  // Auto-save when changes are detected (debounced 800ms)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!isDirty) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      save();
    }, 800);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, meaningfulSignature, removedIds]);

  return (
    <div className="flex flex-col gap-6">
      <ServiceToolbarSection
        query={query}
        onQueryChange={setQuery}
        categories={categories}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

      <ServiceSummarySection
        serviceCount={rows.length}
        categoryCount={categories.length}
        lastUpdatedLabel={lastUpdatedLabel}
        onManageCategories={() => setCategoryDialogOpen(true)}
      />

      {servicesQuery.isError ? (
        <QueryErrorState
          message={t("dashboard.services.errors.loadFailed")}
          retryLabel={t("dashboard.services.errors.retry")}
          onRetry={() => servicesQuery.refetch()}
        />
      ) : (
        <ServicePriceTableSection
          rows={rows}
          visibleRows={visibleRows}
          categories={categories}
          isLoading={servicesQuery.isPending}
          isSaving={bulkSave.isPending}
          isDirty={isDirty}
          error={error}
          onChangeRow={changeRow}
          onAddRow={addRow}
          onRemoveRow={removeRow}
          onReset={() => setPendingReset(true)}
        />
      )}

      <ServiceCategoryDialog
        open={categoryDialogOpen}
        categories={categories}
        onOpenChange={setCategoryDialogOpen}
      />

      <ConfirmDialog
        open={pendingReset}
        title={t("dashboard.services.reset.title")}
        description={t("dashboard.services.reset.description")}
        cancelLabel={t("dashboard.services.reset.keep")}
        confirmLabel={t("dashboard.services.reset.confirm")}
        onOpenChange={(open) => !open && setPendingReset(false)}
        onConfirm={resetDraft}
      />
    </div>
  );
};

export default ServicesPage;
