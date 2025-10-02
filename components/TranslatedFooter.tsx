"use client";

import { useT } from "./LanguageProvider";

export default function TranslatedFooter() {
  const t = useT();
  return (
    <footer className="border-t bg-card/50 backdrop-blur-sm py-4 text-center text-lg">
      {t("footer", { year: new Date().getFullYear() })}
    </footer>
  );
}
