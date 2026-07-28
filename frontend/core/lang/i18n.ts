import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./messages/en.json";
import vi from "./messages/vi.json";

export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "vi";

export const LANGUAGE_STORAGE_KEY = "maiai-language";

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

export const getStoredLanguage = (): SupportedLanguage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (
    storedLanguage &&
    SUPPORTED_LANGUAGES.includes(storedLanguage as SupportedLanguage)
  ) {
    return storedLanguage as SupportedLanguage;
  }

  return null;
};

if (!i18n.isInitialized) {
  // Always initialize with the same fixed language on both server and
  // client's first render. Reading the persisted language here (from
  // localStorage) would make the client's first render diverge from the
  // server-rendered HTML and trigger a hydration mismatch. The persisted
  // language is applied afterwards, once mounted, by I18nProvider.
  i18n.use(initReactI18next).init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
