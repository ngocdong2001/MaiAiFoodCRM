"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import FormDialog from "@/shared/components/molecules/FormDialog";
import FormField from "@/shared/components/molecules/FormField";
import FormSection from "@/shared/components/molecules/FormSection";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

import type { GuestCard, GuestFormValues, GuestTag } from "../types/crm.types";

type Props = {
  open: boolean;
  guest: GuestCard | null;
  tags: GuestTag[];
  submitting: boolean;
  error: string | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: GuestFormValues) => void;
};

const initialValues = (guest: GuestCard | null): GuestFormValues => ({
  name: guest?.name ?? "",
  email: guest?.email ?? "",
  phone: guest?.phone ?? "",
  avatarUrl: guest?.avatarUrl ?? "",
  gender: guest?.gender ?? "",
  dateOfBirth: guest?.dateOfBirth ?? "",
  loyaltyPoints: guest?.loyaltyPoints.toString() ?? "0",
  notes: guest?.notes ?? "",
  tagIds: guest?.tags.map((tag) => tag.id) ?? [],
});

const GuestFormDialog = (props: Props) => {
  if (!props.open) return null;
  return <GuestFormContent key={props.guest?.id ?? "new"} {...props} />;
};

const GuestFormContent = ({
  open,
  guest,
  tags,
  submitting,
  error,
  onOpenChange,
  onSubmit,
}: Props) => {
  const { t } = useTranslation();
  const [values, setValues] = useState(() => initialValues(guest));
  const update = <Key extends keyof GuestFormValues>(
    key: Key,
    value: GuestFormValues[Key],
  ) => setValues((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        guest
          ? t("dashboard.crm.form.editGuest")
          : t("dashboard.crm.form.addGuest")
      }
      description={t("dashboard.crm.form.description")}
      error={error}
      submitLabel={t("dashboard.crm.form.saveGuest")}
      submittingLabel={t("dashboard.crm.form.saving")}
      cancelLabel={t("dashboard.crm.form.cancel")}
      submitting={submitting}
      onSubmit={submit}
      contentClassName="sm:max-w-xl"
    >
      <FormSection>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("dashboard.crm.form.fullName")} required>
            <Input
              value={values.name}
              onChange={(event) => update("name", event.target.value)}
              required
            />
          </FormField>
          <FormField label={t("dashboard.crm.form.phone")}>
            <Input
              value={values.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </FormField>
          <FormField label={t("dashboard.crm.form.email")}>
            <Input
              type="email"
              value={values.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </FormField>
          <FormField label={t("dashboard.crm.form.birthday")}>
            <Input
              type="date"
              value={values.dateOfBirth}
              onChange={(event) => update("dateOfBirth", event.target.value)}
            />
          </FormField>
          <FormField label={t("dashboard.crm.form.gender")}>
            <Input
              value={values.gender}
              onChange={(event) => update("gender", event.target.value)}
            />
          </FormField>
          <FormField label={t("dashboard.crm.form.loyaltyPoints")}>
            <Input
              type="number"
              min="0"
              value={values.loyaltyPoints}
              onChange={(event) => update("loyaltyPoints", event.target.value)}
            />
          </FormField>
          <FormField
            label={t("dashboard.crm.form.avatarUrl")}
            className="sm:col-span-2"
          >
            <Input
              type="url"
              value={values.avatarUrl}
              onChange={(event) => update("avatarUrl", event.target.value)}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title={t("dashboard.crm.form.guestTags")}>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const checked = values.tagIds.includes(tag.id);
            return (
              <label
                key={tag.id}
                className={`relative cursor-pointer rounded-md border px-3 py-2 text-sm ${checked ? "border-primary bg-primary/10 text-primary" : "border-[#DEE1E7]"}`}
              >
                <input
                  type="checkbox"
                  className="absolute inset-0 h-full w-full opacity-0"
                  checked={checked}
                  aria-label={tag.name}
                  onChange={() =>
                    update(
                      "tagIds",
                      checked
                        ? values.tagIds.filter((id) => id !== tag.id)
                        : [...values.tagIds, tag.id],
                    )
                  }
                />
                <span className="pointer-events-none">{tag.name}</span>
              </label>
            );
          })}
        </div>
      </FormSection>

      <FormSection title={t("dashboard.crm.form.ownerNotes")}>
        <Textarea
          value={values.notes}
          onChange={(event) => update("notes", event.target.value)}
          rows={4}
        />
      </FormSection>
    </FormDialog>
  );
};

export default GuestFormDialog;
