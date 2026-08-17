"use client";

import { Check, Clock, DollarSign, Plus, Save, Trash2 } from "lucide-react";
import { useMemo, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import SelectField from "@/shared/components/molecules/SelectField";
import { Button } from "@/shared/components/ui/button";

import type {
  ServiceCategory,
  ServiceDraftRow,
} from "../../types/service.types";

type ServicePriceTableSectionProps = {
  rows: ServiceDraftRow[];
  visibleRows: ServiceDraftRow[];
  categories: ServiceCategory[];
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  error: string | null;
  onChangeRow: (key: string, patch: Partial<ServiceDraftRow>) => void;
  onAddRow: () => void;
  onRemoveRow: (key: string) => void;
  onSave: () => void;
  onReset: () => void;
};

const currency = new Intl.NumberFormat("vi-VN");

const cellInput =
  "w-full bg-transparent text-sm text-[#171A21] outline-none placeholder:text-[#B4BAC5] focus:rounded-md focus:bg-[#F5F7FA] focus:px-2 focus:py-1";

const ServicePriceTableSection = ({
  rows,
  visibleRows,
  categories,
  isLoading,
  isSaving,
  isDirty,
  error,
  onChangeRow,
  onAddRow,
  onRemoveRow,
  onSave,
  onReset,
}: ServicePriceTableSectionProps) => {
  const { t } = useTranslation();
  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    [categories],
  );
  const totalValue = rows.reduce(
    (sum, row) => sum + (Number(row.price) || 0),
    0,
  );
  const averageValue = rows.length ? Math.round(totalValue / rows.length) : 0;

  const handleLastRowEnter = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key !== "Enter" || index !== visibleRows.length - 1) return;
    event.preventDefault();
    onAddRow();
  };

  return (
    <section className="rounded-xl border border-[#DEE1E7] bg-white">
      <header className="flex items-center justify-between gap-4 px-6 py-4">
        <h2 className="text-base font-semibold text-[#171A21]">
          {t("dashboard.services.table.heading")}
        </h2>
        <Button
          type="button"
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className="h-9 gap-2 bg-[#F9D3E1] px-4 text-[#B5316A] hover:bg-[#F4BDD2] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {isSaving
            ? t("dashboard.services.table.saving")
            : t("dashboard.services.table.save")}
        </Button>
      </header>

      {error ? (
        <p className="mx-6 mb-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="overflow-x-auto border-t border-[#EDEFF3]">
        <table className="w-full min-w-[880px] border-collapse">
          <thead>
            <tr className="bg-[#FBFCFD] text-left text-[11px] uppercase tracking-wide text-[#9AA1AE]">
              <th className="w-14 px-6 py-3 font-medium">
                {t("dashboard.services.table.index")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("dashboard.services.table.name")}
              </th>
              <th className="w-56 px-4 py-3 font-medium">
                {t("dashboard.services.table.category")}
              </th>
              <th className="w-40 px-4 py-3 font-medium">
                {t("dashboard.services.table.duration")}
              </th>
              <th className="w-48 px-4 py-3 font-medium">
                {t("dashboard.services.table.price")}
              </th>
              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-[#8D95A5]"
                >
                  {t("dashboard.services.table.loading")}
                </td>
              </tr>
            ) : null}

            {!isLoading && visibleRows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm text-[#8D95A5]"
                >
                  {t("dashboard.services.table.empty")}
                </td>
              </tr>
            ) : null}

            {visibleRows.map((row, index) => (
              <tr
                key={row.key}
                className="border-t border-[#EDEFF3] transition-colors hover:bg-[#FBFCFD]"
              >
                <td className="px-6 py-3 text-sm text-[#B4BAC5]">
                  {index + 1}
                </td>

                <td className="px-4 py-3">
                  <input
                    value={row.name}
                    placeholder={t("dashboard.services.table.namePlaceholder")}
                    onChange={(event) =>
                      onChangeRow(row.key, { name: event.target.value })
                    }
                    onKeyDown={(event) => handleLastRowEnter(event, index)}
                    className={cellInput}
                  />
                </td>

                <td className="px-4 py-3">
                  <SelectField
                    value={row.categoryId ? String(row.categoryId) : ""}
                    onValueChange={(value) =>
                      onChangeRow(row.key, {
                        categoryId: value ? Number(value) : null,
                      })
                    }
                    options={categoryOptions}
                    placeholder={t("dashboard.services.table.selectCategory")}
                    ariaLabel={t("dashboard.services.table.category")}
                    className="h-9 border-[#EDEFF3] bg-transparent text-sm text-[#171A21] hover:bg-[#F5F7FA]"
                  />
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-[#8D95A5]">
                    <Clock className="h-3.5 w-3.5" />
                    <input
                      type="number"
                      min={1}
                      value={row.durationMinutes}
                      onChange={(event) =>
                        onChangeRow(row.key, {
                          durationMinutes: event.target.value,
                        })
                      }
                      onKeyDown={(event) => handleLastRowEnter(event, index)}
                      className={`${cellInput} w-16 font-medium`}
                    />
                    <span className="text-xs">
                      {t("dashboard.services.table.minutes")}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-[#8D95A5]">
                    <DollarSign className="h-3.5 w-3.5" />
                    <input
                      type="number"
                      min={0}
                      step="1000"
                      value={row.price}
                      onChange={(event) =>
                        onChangeRow(row.key, { price: event.target.value })
                      }
                      onKeyDown={(event) => handleLastRowEnter(event, index)}
                      className={`${cellInput} w-28 font-semibold text-[#171A21]`}
                    />
                    <span className="text-xs">
                      {t("dashboard.services.table.currency")}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t("dashboard.services.table.deleteRow", {
                      name:
                        row.name || t("dashboard.services.table.newRowLabel"),
                    })}
                    onClick={() => onRemoveRow(row.key)}
                    className="h-8 w-8 text-[#B4BAC5] hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}

            <tr className="border-t border-[#EDEFF3]">
              <td colSpan={6} className="px-6 py-3">
                <button
                  type="button"
                  onClick={onAddRow}
                  className="flex w-full items-center gap-3 text-left text-sm italic text-[#B4BAC5] hover:text-[#8D95A5]"
                >
                  <Plus className="h-4 w-4" />
                  {t("dashboard.services.table.addRowHint")}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer className="flex flex-col gap-4 border-t border-[#EDEFF3] px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-8">
          <div>
            <p className="text-xs text-[#8D95A5]">
              {t("dashboard.services.table.totalValue")}
            </p>
            <p className="text-xl font-bold text-[#E5397F]">
              {currency.format(totalValue)}{" "}
              {t("dashboard.services.table.currency")}
            </p>
          </div>
          <div className="border-l border-[#EDEFF3] pl-8">
            <p className="text-xs text-[#8D95A5]">
              {t("dashboard.services.table.averageValue")}
            </p>
            <p className="text-xl font-bold text-[#171A21]">
              {currency.format(averageValue)}{" "}
              {t("dashboard.services.table.currency")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onReset}
            disabled={!isDirty || isSaving}
            className="h-10 text-[#8D95A5]"
          >
            {t("dashboard.services.table.cancel")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onAddRow}
            className="h-10 gap-2 border-[#DEE1E7]"
          >
            <Plus className="h-4 w-4" />
            {t("dashboard.services.table.addRow")}
          </Button>
          <Button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="h-10 gap-2 bg-[#E5397F] px-5 text-white hover:bg-[#CF2F71]"
          >
            <Check className="h-4 w-4" />
            {t("dashboard.services.table.finish")}
          </Button>
        </div>
      </footer>
    </section>
  );
};

export default ServicePriceTableSection;
