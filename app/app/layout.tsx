import type { Metadata } from "next";
import Link from "next/link";
import { Playfair_Display, Montserrat } from "next/font/google";
import Nav from "@/components/Nav";
import NoContextMenu from "@/components/NoContextMenu";
import Splash from "@/components/Splash";
import GridField from "@/components/GridField";
import NavLoader from "@/components/NavLoader";
import SmoothScroll from "@/components/SmoothScroll";
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

const TITLE = "Mnemosyne";
const DESCRIPTION =
  "An archive of decisions, not just outcomes. The reasoning behind what Aditya Kamarouthu builds, captured over time.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mnemosyne-six.vercel.app"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://mnemosyne-six.vercel.app",
    siteName: TITLE,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      <body className="min-h-screen antialiased">
        <GridField />
        <NoContextMenu />
        <Splash />
        <NavLoader />
        <SmoothScroll>
        <header className="relative bg-paper border-b border-rule">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 sm:px-6 sm:py-5">
            <Link href="/" className="group inline-flex items-baseline">
              <span className="inline-block font-display text-xl font-semibold tracking-tight text-ink underline-offset-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:underline">
                Mnemosyne
              </span>
            </Link>
            <Nav />
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>

        <footer className="relative mt-20 bg-paper border-t border-rule sm:mt-24">
          <div className="mx-auto flex max-w-5xl flex-col gap-1 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="label">Mnemosyne</p>
            <p className="text-[14px] text-ink-faint">
              Designed and built by{" "}
              <span className="font-medium text-ink-soft">Aditya Kamarouthu</span>. Sole creator.
            </p>
          </div>
        </footer>
        </SmoothScroll>
      </body>
    </html>
  );
}
