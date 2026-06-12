"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footprints, House, ListChecks, Scale, Settings } from "lucide-react";

const tabs = [
  { href: "/", label: "Today", Icon: House },
  { href: "/activity", label: "Activity", Icon: Footprints },
  { href: "/body", label: "Body", Icon: Scale },
  { href: "/habits", label: "Habits", Icon: ListChecks },
  { href: "/settings", label: "Settings", Icon: Settings },
];

export default function TabBar() {
  const pathname = usePathname();
  if (pathname === "/pin") return null;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Mobile: bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-sep/60 bg-white/80 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-xl items-stretch justify-around pb-[max(8px,var(--safe-bottom))] pt-2">
          {tabs.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className="flex w-16 flex-col items-center gap-0.5"
              >
                <Icon
                  size={24}
                  strokeWidth={active ? 2.4 : 1.8}
                  className={active ? "text-blue" : "text-secondary"}
                />
                <span
                  className={`text-[10px] font-medium ${
                    active ? "text-blue" : "text-secondary"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-1 border-r border-sep/60 bg-white/60 p-4 pt-10 backdrop-blur-xl md:flex">
        <div className="mb-6 px-3 text-[22px] font-bold tracking-tight">Pace</div>
        {tabs.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-ios px-3 py-2.5 text-[15px] font-medium transition ${
                active
                  ? "bg-blue/10 text-blue"
                  : "text-label hover:bg-black/[0.04]"
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.3 : 1.8} />
              {label}
            </Link>
          );
        })}
      </aside>
    </>
  );
}
