"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Construction, Home, Rocket, Sparkles, Clock } from "lucide-react";
import { useT } from "@/components/LanguageProvider";

export default function NotFoundPage() {
  const t = useT();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-2xl"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-28 h-28 rounded-3xl bg-gradient-to-br from-yellow-400/20 to-orange-500/20 backdrop-blur-sm flex items-center justify-center border border-yellow-500/20 shadow-2xl shadow-yellow-500/10"
          >
            <Construction className="w-14 h-14 text-yellow-600 dark:text-yellow-400" strokeWidth={2} />
          </motion.div>

          {/* Sparkle */}
          <motion.div
            animate={{ y: [-10, -20, -10], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </motion.div>
        </motion.div>

        {/* Text */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text"
          >
            {t("notfound.title")}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-2"
          >
            <p className="text-xl text-muted-foreground font-medium">
              {t("notfound.subtitle")}
            </p>
            <p className="text-base text-muted-foreground/80 max-w-lg mx-auto">
              {t("notfound.description")}
            </p>
          </motion.div>

          {/* Status Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400"
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{t("notfound.status")}</span>
          </motion.div>
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          <Link href="/">
            <Button size="lg" className="group gap-2 px-8 h-12 text-base font-medium shadow-lg hover:shadow-xl">
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {t("notfound.backHome")}
            </Button>
          </Link>
          <Link href="/numerical-analysis">
            <Button
              size="lg"
              variant="outline"
              className="group gap-2 px-8 h-12 text-base font-medium border-2 hover:bg-primary/5"
            >
              <Rocket className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              {t("notfound.explore")}
            </Button>
          </Link>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-8 w-full max-w-xs"
        >
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "65%" }}
              transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("notfound.progress", { value: 65 })}
          </p>
        </motion.div>
      </motion.div>
    </main>
  );
}
