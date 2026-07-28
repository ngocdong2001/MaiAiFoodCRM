"use client";

import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import i18n, { getStoredLanguage } from "../i18n";

type I18nProviderProps = {
  children: ReactNode;
};

/**
 * Wraps the application with the i18next context and syncs the <html lang>
 * attribute whenever the active language changes. Language switching is
 * fully client-side (no route/URL changes), so it stays simple for
 * non-technical users.
 *
 * i18n always initializes with the same default language on the server and
 * on the client's first render (see core/lang/i18n.ts) to avoid a hydration
 * mismatch. Once mounted (after hydration), we switch to the user's
 * previously persisted language, if any.
 */
const I18nProvider = ({ children }: I18nProviderProps) => {
  const [isReady, setIsReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!isReady) {
      setIsReady(true);
    }
  }, [isReady]);

  useEffect(() => {
    const storedLanguage = getStoredLanguage();
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
    }

    const updateHtmlLang = (lng: string) => {
      document.documentElement.lang = lng;
    };

    updateHtmlLang(i18n.language);
    i18n.on("languageChanged", updateHtmlLang);

    return () => {
      i18n.off("languageChanged", updateHtmlLang);
    };
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
};

export default I18nProvider;
