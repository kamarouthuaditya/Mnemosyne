"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview" },
  { href: "/timeline", label: "Timeline" },
  { href: "/achievements", label: "Achievements" },
  { href: "/weekly", label: "Weekly" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-x-5 gap-y-1.5 sm:gap-6">
      {links.map((n) => {
        const active = n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`text-[14px] font-medium underline-offset-[6px] transition-colors ${
              active
                ? "text-ink underline decoration-ink decoration-2"
                : "text-ink-soft hover:text-ink"
            }`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}
