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
            className={`group relative inline-block text-[14px] font-medium transition-[color,transform] duration-300 ease-out hover:-translate-y-0.5 ${
              active ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            {n.label}
            <span
              aria-hidden
              className={`absolute -bottom-1 left-0 h-[2px] w-full origin-left bg-ink transition-transform duration-300 ease-out ${
                active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
