"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import EditableTextField from "@/shared/components/molecules/EditableTextField";
import PrimaryButton from "@/shared/components/molecules/button/PrimaryButton";
import { useSubmitInfo } from "@/features/landing/hooks/useSubmitInfo";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  salonName: string;
};

type EarlyAccessDialogFormProps = {
  onSuccess?: () => void;
};

const initialValues: FormValues = {
  firstName: "",
  lastName: "",
  email: "",
  salonName: "",
};

const EarlyAccessDialogForm = ({ onSuccess }: EarlyAccessDialogFormProps) => {
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<FormValues>(initialValues);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});

  const { mutate: submitInfo, isPending } = useSubmitInfo({
    onSuccess: () => {
      setFormValues(initialValues);
      setFormErrors({});
      onSuccess?.();
    },
    onError: (error) => {
      alert(t("hero.form.errorMessage", { message: error.message }));
    },
  });

  const validateField = (field: keyof FormValues, value: string): string => {
    const trimmed = value.trim();
    switch (field) {
      case "firstName":
        return trimmed ? "" : t("hero.form.errors.firstNameRequired");
      case "lastName":
        return trimmed ? "" : t("hero.form.errors.lastNameRequired");
      case "salonName":
        return trimmed ? "" : t("hero.form.errors.salonNameRequired");
      case "email": {
        if (!trimmed) return t("hero.form.errors.emailRequired");
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
          ? ""
          : t("hero.form.errors.emailInvalid");
      }
      default:
        return "";
    }
  };

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({
      ...prev,
      [field]: validateField(field, value),
    }));
  };

  const handleSubmit = () => {
    const errors = (Object.keys(formValues) as Array<keyof FormValues>).reduce<
      Partial<Record<keyof FormValues, string>>
    >((acc, field) => {
      const msg = validateField(field, formValues[field]);
      if (msg) acc[field] = msg;
      return acc;
    }, {});

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    submitInfo(formValues);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <EditableTextField
          label={t("hero.form.firstName")}
          placeholder={t("hero.form.firstNamePlaceholder")}
          helperTextType="error"
          helperText={formErrors.firstName}
          value={formValues.firstName}
          onChange={(e) => handleChange("firstName", e.target.value)}
        />
        <EditableTextField
          label={t("hero.form.lastName")}
          placeholder={t("hero.form.lastNamePlaceholder")}
          helperTextType="error"
          helperText={formErrors.lastName}
          value={formValues.lastName}
          onChange={(e) => handleChange("lastName", e.target.value)}
        />
      </div>

      <EditableTextField
        label={t("hero.form.workEmail")}
        placeholder={t("hero.form.workEmailPlaceholder")}
        helperTextType="error"
        helperText={formErrors.email}
        type="email"
        value={formValues.email}
        onChange={(e) => handleChange("email", e.target.value)}
      />

      <EditableTextField
        label={t("hero.form.salonName")}
        placeholder={t("hero.form.salonNamePlaceholder")}
        helperTextType="error"
        helperText={formErrors.salonName}
        value={formValues.salonName}
        onChange={(e) => handleChange("salonName", e.target.value)}
      />

      <PrimaryButton
        label={isPending ? t("hero.form.submitting") : t("hero.form.signUp")}
        className="mt-1 w-full"
        onClick={handleSubmit}
        disabled={isPending}
      />
    </div>
  );
};

export default EarlyAccessDialogForm;
