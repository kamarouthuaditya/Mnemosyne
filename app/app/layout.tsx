import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display, Montserrat } from "next/font/google";
import Nav from "@/components/Nav";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mnemosyne",
  description:
    "A career memory. Not just what Aditya Kamarouthu built, but how he reasoned about it.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="min-h-screen antialiased">
        <header className="border-b border-rule">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
            <Link href="/" className="group flex items-baseline gap-2.5">
              <span className="font-display text-xl font-semibold tracking-tight text-ink">
                Mnemosyne
              </span>
              <span className="label hidden sm:inline">Career Memory</span>
            </Link>
            <Nav />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>

        <footer className="mt-20 border-t border-rule sm:mt-24">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="label">Mnemosyne</p>
            <p className="text-[14px] text-ink-faint">
              Designed and built by{" "}
              <span className="font-medium text-ink-soft">Aditya Kamarouthu</span>. Sole creator.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
