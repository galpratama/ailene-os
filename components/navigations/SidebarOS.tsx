"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Moon, Search, Sparkles } from "lucide-react";

const mainNav = [
  { href: "/", label: "Home", exact: true },
  { href: "/leads", label: "Leads · B2B", badge: 11 },
  { href: "/traction", label: "Traction · B2C" },
  { href: "/projects", label: "Projects", badge: 9 },
  { href: "/tasks", label: "Tasks", badge: 35 },
  { href: "/calendar", label: "Calendar" },
  { href: "/trainers", label: "Trainers", badge: 6 },
  { href: "/module", label: "Module" },
  { href: "/revenue", label: "Revenue" },
];

const toolsNav = [{ href: "/settings", label: "Settings" }];

function NavItem({
  href,
  label,
  badge,
  exact,
}: {
  href: string;
  label: string;
  badge?: number;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`relative flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
        active
          ? "bg-green-50 text-green-800 font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-green-600 rounded-full" />
      )}
      <div className="flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            active ? "bg-green-600" : "bg-gray-400"
          }`}
        />
        <span>{label}</span>
      </div>
      {badge != null && (
        <span className="text-xs text-gray-400 font-medium tabular-nums">
          {badge}
        </span>
      )}
    </Link>
  );
}

export default function SidebarOS() {
  return (
    <aside className="w-64 shrink-0 bg-white flex flex-col h-screen sticky top-0 border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-gray-900 leading-none">
            Ailene OS
          </span>
          <span className="text-xs text-gray-400 mt-0.5 leading-none">
            INTERNAL HQ
          </span>
        </div>
      </div>

      {/* Org selector */}
      <div className="px-3 pb-3">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="flex-1 text-left text-sm font-medium text-gray-800 truncate">
            Ailene Group
          </span>
          <ChevronDown size={13} className="text-gray-400 shrink-0" />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-400 hover:bg-gray-100 transition-colors">
          <Search size={13} />
          <span className="flex-1 text-left text-sm">Search...</span>
          <span className="text-xs text-gray-400">⌘K</span>
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-0.5 px-2 py-1">
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Tools */}
      <div className="px-2 mt-3">
        <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Tools
        </p>
        <div className="flex flex-col gap-0.5 mt-0.5">
          {toolsNav.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}
        </div>
      </div>

      {/* User footer */}
      <div className="mt-auto border-t border-gray-100 px-3 py-3 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
          RR
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            Rusherly Rinlohok
          </p>
          <p className="text-xs text-gray-400 truncate">manager</p>
        </div>
        <button className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
          <Moon size={14} />
        </button>
      </div>
    </aside>
  );
}
