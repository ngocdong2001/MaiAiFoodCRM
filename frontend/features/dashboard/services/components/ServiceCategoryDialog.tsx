"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import ConfirmDialog from "@/shared/components/molecules/ConfirmDialog";
import EmptyState from "@/shared/components/molecules/EmptyState";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { getApiErrorMessage } from "@/shared/lib/apiError";

import {
  useCreateServiceCategory,
  useDeleteServiceCategory,
  useUpdateServiceCategory,
} from "../hooks/useServices";
import type {
  ServiceCategory,
  ServiceCategoryFormValues,
} from "../types/service.types";

type ServiceCategoryDialogProps = {
  open: boolean;
  categories: ServiceCategory[];
  onOpenChange: (open: boolean) => void;
};

const emptyForm: ServiceCategoryFormValues = {
  name: "",
  description: "",
  icon: "",
  sortOrder: 0,
  isActive: true,
};

const getApiError = getApiErrorMessage;

const ServiceCategoryDialog = ({
  open,
  categories,
  onOpenChange,
}: ServiceCategoryDialogProps) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<ServiceCategoryFormValues>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createCategory = useCreateServiceCategory();
  const updateCategory = useUpdateServiceCategory();
  const deleteCategory = useDeleteServiceCategory();
  const submitting = createCategory.isPending || updateCategory.isPending;

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  };

  const startEdit = (category: ServiceCategory) => {
    setEditingId(category.id);
    setError(null);
    setForm({
      name: category.name,
      description: category.description ?? "",
      icon: category.icon ?? "",
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
  };

  const submit = async () => {
    if (!form.name.trim()) {
      setError(t("dashboard.services.categoryDialog.nameRequired"));
      return;
    }
    setError(null);
    try {
      if (editingId) {
        await updateCategory.mutateAsync({ id: editingId, values: form });
      } else {
        await createCategory.mutateAsync(form);
      }
      resetForm();
    } catch (submitError) {
      setError(
        getApiError(
          submitError,
          t("dashboard.services.categoryDialog.saveError"),
        ),
      );
    }
  };

  const remove = async (category: ServiceCategory) => {
    setError(null);
    try {
      await deleteCategory.mutateAsync(category.id);
      if (editingId === category.id) resetForm();
    } catch (deleteError) {
      setError(
        getApiError(
          deleteError,
          t("dashboard.services.categoryDialog.saveError"),
        ),
      );
    }
  };

  const [deleteConfirmCategory, setDeleteConfirmCategory] = useState<ServiceCategory | null>(null);

  const handleBlurAdd = () => {
    if (!form.name.trim()) return;
    submit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetForm();
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t("dashboard.services.categoryDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {t("dashboard.services.categoryDialog.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {categories.length === 0 ? (
            <EmptyState
              className="p-4"
              message={t("dashboard.services.categoryDialog.empty")}
            />
          ) : null}

          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-[#DEE1E7] px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-[#171A21]">
                  {category.name}
                </p>
                <p className="text-xs text-[#8D95A5]">
                  {t("dashboard.services.categoryDialog.serviceCount", {
                    count: category.serviceCount,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("dashboard.services.categoryDialog.edit", {
                    name: category.name,
                  })}
                  onClick={() => startEdit(category)}
                  className="h-8 w-8 text-[#8D95A5]"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={t("dashboard.services.categoryDialog.delete", {
                    name: category.name,
                  })}
                  disabled={deleteCategory.isPending}
                  onClick={() => setDeleteConfirmCategory(category)}
                  className="h-8 w-8 text-[#8D95A5] hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#EDEFF3] pt-4">
          <Input
            value={form.name}
            placeholder={t("dashboard.services.categoryDialog.namePlaceholder")}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            onBlur={handleBlurAdd}
          />
          <Input
            value={form.description}
            placeholder={t(
              "dashboard.services.categoryDialog.descriptionPlaceholder",
            )}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
          />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <div className="flex items-center justify-end gap-2">
            {editingId ? (
              <Button
                type="button"
                variant="ghost"
                onClick={resetForm}
                className="gap-2 text-[#8D95A5]"
              >
                <X className="h-4 w-4" />
                {t("dashboard.services.categoryDialog.cancelEdit")}
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="gap-2 bg-[#E5397F] text-white hover:bg-[#CF2F71]"
            >
              <Plus className="h-4 w-4" />
              {editingId
                ? t("dashboard.services.categoryDialog.update")
                : t("dashboard.services.categoryDialog.create")}
            </Button>
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={deleteConfirmCategory !== null}
        title={t("dashboard.services.deleteConfirm.title")}
        description={t("dashboard.services.deleteConfirm.description", {
          name: deleteConfirmCategory?.name ?? "",
        })}
        confirmLabel={t("dashboard.services.deleteConfirm.confirm")}
        cancelLabel={t("dashboard.services.deleteConfirm.cancel")}
        destructive
        onOpenChange={(open) => !open && setDeleteConfirmCategory(null)}
        onConfirm={() => {
          if (deleteConfirmCategory) remove(deleteConfirmCategory);
          setDeleteConfirmCategory(null);
        }}
      />
    </Dialog>
  );
};

export default ServiceCategoryDialog;
