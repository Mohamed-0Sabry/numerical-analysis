"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "na-theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [mounted, setMounted] = useState(false);

  // Initialize theme after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      } else {
        // Check current class on html element (set by inline script)
        const isDark = document.documentElement.classList.contains("dark");
        setTheme(isDark ? "dark" : "light");
      }
    } catch {
      setTheme("light");
    }
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!theme) return;

    const root = document.documentElement;
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Prevent hydration mismatch by rendering placeholder until mounted
  if (!mounted || !theme) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="ml-auto"
        disabled
        aria-label="Loading theme"
      >
        <div className="w-4 h-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      variant="ghost"
      size="sm"
      className="ml-auto"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
      <span className="sr-only">
        {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </Button>
  );
}