"use client";

import { useTranslation } from "react-i18next";

import ErrorPage from "@/shared/components/molecules/ErrorPage";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <ErrorPage
      statusCode={404}
      title={t("errors.notFoundTitle")}
      description={t("errors.notFoundDescription")}
    />
  );
}
