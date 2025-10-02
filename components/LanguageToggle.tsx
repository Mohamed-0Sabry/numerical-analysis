// /components/LanguageToggle.tsx
"use client";

import React from "react";
import { useLocale } from "./LanguageProvider";
import ReactCountryFlag from "react-country-flag";

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <button
        aria-label="Switch to English"
        onClick={() => setLocale("en")}
        className={`px-2 py-1 rounded-md transition-colors ${
          locale === "en" ? "bg-accent/80 text-white" : "bg-transparent"
        }`}
      >
        <ReactCountryFlag
          countryCode="US"
          svg
          style={{ width: "1.8em", height: "1.8em" }}
        />
      </button>
      <button
        aria-label="التبديل إلى العربية"
        onClick={() => setLocale("ar")}
        className={`px-2 py-1 rounded-md transition-colors ${
          locale === "ar" ? "bg-accent/80 text-white" : "bg-transparent"
        }`}
      >
        <ReactCountryFlag
          countryCode="EG" // change to "SA" if you prefer Saudi flag
          svg
          style={{ width: "1.8em", height: "1.8em" }}
        />
      </button>
    </div>
  );
}
