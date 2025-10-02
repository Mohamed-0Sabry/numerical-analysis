// app/page.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import AuraBackground from "@/components/AuraBackground";
import Image from "next/image";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function HomePage() {
  return (
    <main className="min-h-screen relative flex flex-col">
      <AuraBackground />

      <header className="container mx-auto px-6 py-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
            {/* optional logo */}
            <Image src="/icon-512.png" alt="logo" width={28} height={28} className="object-contain" />
          <div>
            <div className="text-sm font-semibold tracking-wide text-foreground">Numerical Analysis</div>
            <div className="text-xs text-muted-foreground">Visualizer & learning playground</div>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/numerical-analysis" className="hidden md:inline">
            <Button size="sm" variant="ghost">Open Tool</Button>
          </Link>
          <Link href="/docs" className="hidden md:inline">
            <Button size="sm" variant="outline">Docs</Button>
          </Link>
          <Link href="/examples" className="hidden md:inline">
            <Button size="sm" variant="ghost">Examples</Button>
          </Link>
          <ThemeToggle />
        </nav>
      </header>

      <section className="container mx-auto px-6 flex-1 flex flex-col items-center justify-center text-center">
        <motion.h1
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight"
        >
          👋 Hello, I'm Sabry — <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400">solve numerically with joy</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="mt-4 max-w-2xl text-lg text-muted-foreground"
        >
          An interactive playground for root finding, iteration methods, and visual intuition. Perfect for students, teachers, or anyone who likes math that moves.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          <Link href="/numerical-analysis">
            <Button size="lg" className="px-6 py-4">
              🚀 Try the Visualizer
            </Button>
          </Link>

          <Link href="/examples">
            <Button size="lg" variant="outline" className="px-6 py-4">
              ✨ Examples & Tutorials
            </Button>
          </Link>

          <Link href="/docs">
            <Button size="lg" variant="ghost" className="px-6 py-4">
              📚 Read the Docs
            </Button>
          </Link>
        </motion.div>

        {/* Feature cards */}
        <div className="mt-12 w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
          <motion.div whileHover={{ y: -6 }} className="p-5 rounded-2xl bg-card/60 backdrop-blur border border-muted/20">
            <div className="text-xl font-semibold mb-1">Visual Iterations</div>
            <p className="text-sm text-muted-foreground">Watch each step animate: shrinking brackets, tangent approximations, and convergence traces.</p>
          </motion.div>

          <motion.div whileHover={{ y: -6 }} className="p-5 rounded-2xl bg-card/60 backdrop-blur border border-muted/20">
            <div className="text-xl font-semibold mb-1">Interactive Grid</div>
            <p className="text-sm text-muted-foreground">Pan, zoom, and probe functions — perfect for exploration and teaching.</p>
          </motion.div>

          <motion.div whileHover={{ y: -6 }} className="p-5 rounded-2xl bg-card/60 backdrop-blur border border-muted/20">
            <div className="text-xl font-semibold mb-1">Export & Share</div>
            <p className="text-sm text-muted-foreground">Save iterations, screenshots, or share problem setups with colleagues.</p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
