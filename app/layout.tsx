import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Numerical Analysis Helper Tool",
  description:
    "I've created this tool to help you with numerical analysis tasks & problems, don't forget to give it a try - Made with Love <3 'Sabry'.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="na-theme"
        >

        <main className="flex-1">{children}</main>

        <footer className="border-t bg-card/50 backdrop-blur-sm py-4 text-center text-lg">
          © {new Date().getFullYear()} Sabry — Created with ❤️ so you can solve with ease.
        </footer>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
