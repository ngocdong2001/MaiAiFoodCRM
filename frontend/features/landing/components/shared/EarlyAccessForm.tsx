"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import EditableTextField from "@/shared/components/molecules/EditableTextField";
import PrimaryButton from "@/shared/components/molecules/button/PrimaryButton";
import { useSubmitInfo } from "@/features/landing/hooks/useSubmitInfo";

type EarlyAccessFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  salonName: string;
};

type EarlyAccessFormProps = {
  onSuccess?: () => void;
};

const initialValues: EarlyAccessFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  salonName: "",
};

const EarlyAccessForm = ({ onSuccess }: EarlyAccessFormProps) => {
  const { t } = useTranslation();
  const [formValues, setFormValues] =
    useState<EarlyAccessFormValues>(initialValues);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof EarlyAccessFormValues, string>>
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

  const validateField = (
    field: keyof EarlyAccessFormValues,
    value: string,
  ): string => {
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
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(trimmed)
          ? ""
          : t("hero.form.errors.emailInvalid");
      }
      default:
        return "";
    }
  };

  const handleInputChange = (
    field: keyof EarlyAccessFormValues,
    value: string,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: validateField(field, value),
    }));
  };

  const handleSignup = () => {
    const nextErrors = (
      Object.keys(formValues) as Array<keyof EarlyAccessFormValues>
    ).reduce<Partial<Record<keyof EarlyAccessFormValues, string>>>(
      (errors, field) => {
        const message = validateField(field, formValues[field]);
        if (message) errors[field] = message;
        return errors;
      },
      {},
    );

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    submitInfo(formValues);
  };

  return (
    <>
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:mt-4 sm:gap-3 xs:grid-cols-2">
        <EditableTextField
          label={t("hero.form.firstName")}
          placeholder={t("hero.form.firstNamePlaceholder")}
          helperTextType="error"
          helperText={formErrors.firstName}
          value={formValues.firstName}
          onChange={(event) =>
            handleInputChange("firstName", event.target.value)
          }
        />
        <EditableTextField
          label={t("hero.form.lastName")}
          placeholder={t("hero.form.lastNamePlaceholder")}
          helperTextType="error"
          helperText={formErrors.lastName}
          value={formValues.lastName}
          onChange={(event) =>
            handleInputChange("lastName", event.target.value)
          }
        />
      </div>

      <div className="mt-2.5 sm:mt-3">
        <EditableTextField
          label={t("hero.form.workEmail")}
          placeholder={t("hero.form.workEmailPlaceholder")}
          helperTextType="error"
          helperText={formErrors.email}
          type="email"
          value={formValues.email}
          onChange={(event) => handleInputChange("email", event.target.value)}
        />
      </div>

      <div className="mt-2.5 sm:mt-3">
        <EditableTextField
          label={t("hero.form.salonName")}
          placeholder={t("hero.form.salonNamePlaceholder")}
          helperTextType="error"
          helperText={formErrors.salonName}
          value={formValues.salonName}
          onChange={(event) =>
            handleInputChange("salonName", event.target.value)
          }
        />
      </div>

      <div className="mt-3.5 flex flex-col gap-2">
        <PrimaryButton
          label={isPending ? t("hero.form.submitting") : t("hero.form.signUp")}
          className="px-4 py-2.5"
          onClick={handleSignup}
          disabled={isPending}
        />
      </div>
    </>
  );
};

export default EarlyAccessForm;
