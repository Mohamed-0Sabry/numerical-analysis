// /components/LanguageProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

type Locale = "en" | "ar";
type Translations = Record<string, string>;

const LOCALE_KEY = "na-lang";

const localesMap: Record<Locale, Translations> = {
  en: en as Translations,
  ar: ar as Translations,
};

type LangContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LangContext = createContext<LangContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem(LOCALE_KEY) : null;
      if (stored === "ar" || stored === "en") return stored;
      const nav = typeof navigator !== "undefined" ? navigator.language : "en";
      return nav.startsWith("ar") ? "ar" : "en";
    } catch {
      return "en";
    }
  });

  useEffect(() => {
    // persist and set html attributes for dir/lang
    try {
      localStorage.setItem(LOCALE_KEY, locale);
    } catch {}
    document.documentElement.lang = locale === "en" ? "en" : "ar";
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = (l: Locale) => setLocaleState(l);

  const t = (key: string, vars?: Record<string, string | number>) => {
    const lookup = localesMap[locale] ?? localesMap.en;
    let val = lookup[key] ?? localesMap.en[key] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v));
      });
    }
    return val;
  };

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLocale must be used inside LanguageProvider");
  return { locale: ctx.locale, setLocale: ctx.setLocale };
}

export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used inside LanguageProvider");
  return ctx.t;
}
