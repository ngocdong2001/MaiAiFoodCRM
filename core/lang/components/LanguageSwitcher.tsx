"use client";

import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "../i18n";
import EditableComboBox from "@/shared/components/molecules/EditableComboBox";

type LanguageSwitcherProps = {
  className?: string;
};

/**
 * Simple dropdown to switch the active language instantly on the client,
 * no routing involved. Designed to be easy to spot/use for non-technical
 * users (e.g. placed in the header).
 */
const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n.language ??
    DEFAULT_LANGUAGE) as SupportedLanguage;

  const handleChange = (value: SupportedLanguage) => {
    i18n.changeLanguage(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
    }
  };

  return (
    <EditableComboBox<SupportedLanguage>
      value={currentLanguage}
      onValueChange={handleChange}
      icon={<Globe size={16} />}
      className={className}
      aria-label={t("languageSwitcher.label")}
      options={SUPPORTED_LANGUAGES.map((lang) => ({
        value: lang,
        label: t(`languageSwitcher.${lang}`),
      }))}
    />
  );
};

export default LanguageSwitcher;
