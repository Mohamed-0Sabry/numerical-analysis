// app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AuraBackground from "@/components/AuraBackground";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useT } from "@/components/LanguageProvider";

export default function HomePage() {
  const t = useT();

  return (
    <main className="min-h-screen relative flex flex-col">
      <AuraBackground />

      <header className="container mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/icon-512.png" alt="logo" width={28} height={28} className="object-contain" />
          <div>
            <div className="text-sm font-semibold tracking-wide text-foreground">{t("site.title")}</div>
            <div className="text-xs text-muted-foreground">{t("site.subtitle")}</div>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/numerical-analysis" className="hidden md:inline">
            <Button size="sm" variant="ghost">{t("openTool")}</Button>
          </Link>
          <Link href="/docs" className="hidden md:inline">
            <Button size="sm" variant="outline">{t("docsNav")}</Button>
          </Link>
          <Link href="/examples" className="hidden md:inline">
            <Button size="sm" variant="ghost">{t("examplesNav")}</Button>
          </Link>
          <ThemeToggle />
          <LanguageToggle />
        </nav>
      </header>

      <section className="container mx-auto px-6 flex-1 flex flex-col items-center justify-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight"
        >
          <span className="mr-2">{t("hello")}</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">{t("tagline")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-4 max-w-2xl text-lg text-muted-foreground"
        >
          {t("description")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          <Link href="/numerical-analysis">
            <Button size="lg" className="px-6 py-4">
              {t("tryVisualizer")}
            </Button>
          </Link>

          <Link href="/examples">
            <Button size="lg" variant="outline" className="px-6 py-4">
              {t("examples")}
            </Button>
          </Link>

          <Link href="/docs">
            <Button size="lg" variant="ghost" className="px-6 py-4">
              {t("docs")}
            </Button>
          </Link>
        </motion.div>

        <div className="mt-12 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -6 }} className="p-5 rounded-2xl bg-card/60 backdrop-blur border border-muted/20">
            <div className="text-xl font-semibold mb-1">{t("feature1.title")}</div>
            <p className="text-sm text-muted-foreground">{t("feature1.desc")}</p>
          </motion.div>

          <motion.div whileHover={{ y: -6 }} className="p-5 rounded-2xl bg-card/60 backdrop-blur border border-muted/20">
            <div className="text-xl font-semibold mb-1">{t("feature2.title")}</div>
            <p className="text-sm text-muted-foreground">{t("feature2.desc")}</p>
          </motion.div>

          <motion.div whileHover={{ y: -6 }} className="p-5 rounded-2xl bg-card/60 backdrop-blur border border-muted/20">
            <div className="text-xl font-semibold mb-1">{t("feature3.title")}</div>
            <p className="text-sm text-muted-foreground">{t("feature3.desc")}</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
