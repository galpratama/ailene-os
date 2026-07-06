"use client";

import AppButton from "@/components/buttons/AppButton";
import { LogoAilene, LogoAileneIcon } from "@/components/svg/LogoAilene";
import { useSidebar } from "@/contexts/SidebarContext";
import { osMainNav, osToolsNav } from "@/lib/os-nav";
import { trpc, setSessionToken } from "@/trpc/client";
import {
  ChevronsLeft,
  ChevronsRight,
  LucideIcon,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const mainNav = osMainNav;
const toolsNav = osToolsNav;

function NavItem({
  href,
  label,
  icon: Icon,
  exact,
  collapsed,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`relative flex items-center rounded-lg text-sm transition-colors ${
        collapsed ? "justify-center px-2 py-2" : "px-3 py-1.5"
      } ${
        active
          ? "bg-sb-item-active-bg text-sb-item-active-text font-medium"
          : "text-sb-text hover:bg-sb-item-hover hover:text-sb-text-strong"
      }`}
    >
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-claude rounded-full" />
      )}
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={15} className="shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
    </Link>
  );
}

function initialsOf(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex shrink-0 items-center rounded-full bg-sb-item-hover p-1 transition-colors"
      aria-label="Toggle dark mode"
      suppressHydrationWarning
    >
      <div className="absolute left-1 size-6 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-in-out dark:translate-x-6 dark:bg-white/10 dark:shadow-none" />
      <span className="relative flex size-6 items-center justify-center">
        <Sun size={12} className="text-sb-text" />
      </span>
      <span className="relative flex size-6 items-center justify-center">
        <Moon size={12} className="text-sb-text" />
      </span>
    </button>
  );
}

function UserFooter({
  sessionToken,
  collapsed,
}: {
  sessionToken: string;
  collapsed: boolean;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data, isLoading } = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const user = data?.user;

  return (
    <div
      className={`mt-auto border-t border-sb-border-soft flex items-center gap-2.5 ${
        collapsed ? "justify-center px-2 py-3" : "px-3 py-3"
      }`}
    >
      {user?.avatar ? (
        <Image
          src={user.avatar}
          alt={user.full_name}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full shrink-0 object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-claude flex items-center justify-center text-xs font-bold text-white shrink-0">
          {isLoading ? "" : initialsOf(user?.full_name ?? "?")}
        </div>
      )}
      {!collapsed && (
        <>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sb-text-strong truncate">
              {isLoading ? "Loading..." : (user?.full_name ?? "Not signed in")}
            </p>
            <p className="text-xs text-sb-text truncate">
              {user?.role_name ?? ""}
            </p>
          </div>
          <ThemeToggle />
        </>
      )}
    </div>
  );
}

export default function SidebarOS({ sessionToken }: { sessionToken: string }) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={`shrink-0 bg-sb-bg flex flex-col h-screen sticky top-0 border-r border-sb-border transition-[width] duration-150 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Collapse toggle */}
      <div className="absolute -right-5 top-5 z-10">
        <AppButton
          variant="outline"
          size="iconSm"
          className="rounded-full shadow-sm"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronsRight size={13} />
          ) : (
            <ChevronsLeft size={13} />
          )}
        </AppButton>
      </div>

      {/* Logo */}
      <div
        className={`flex items-center pt-5 pb-4 mb-3 border-b border-sb-border-soft ${
          isCollapsed ? "justify-center px-2" : "px-4"
        }`}
      >
        {isCollapsed ? (
          <div className="w-9 h-9 rounded-lg border border-sb-border flex items-center justify-center shrink-0 overflow-hidden">
            <LogoAileneIcon className="w-6 h-6" />
          </div>
        ) : (
          <LogoAilene className="h-6 w-auto" />
        )}
      </div>

      {/* Org selector */}
      <div className={isCollapsed ? "px-2 pb-3" : "px-3 pb-3"}>
        <AppButton
          variant="outline"
          size="md"
          className={`w-full ${isCollapsed ? "justify-center px-0" : "justify-between"}`}
        >
          <span className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-claude shrink-0" />
            {!isCollapsed && (
              <span className="text-left font-medium text-sb-text-strong truncate">
                Operating System
              </span>
            )}
          </span>
        </AppButton>
      </div>

      {/* Main nav */}
      <nav
        className={`flex flex-col gap-0.5 py-1 ${isCollapsed ? "px-2" : "px-2"}`}
      >
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} collapsed={isCollapsed} />
        ))}
      </nav>

      {/* Tools */}
      <div className={isCollapsed ? "px-2 mt-3" : "px-2 mt-3"}>
        {!isCollapsed && (
          <p className="px-3 py-1 text-xs font-semibold text-sb-text uppercase tracking-wider">
            Tools
          </p>
        )}
        <div className="flex flex-col gap-0.5 mt-0.5">
          {toolsNav.map((item) => (
            <NavItem key={item.href} {...item} collapsed={isCollapsed} />
          ))}
        </div>
      </div>

      <UserFooter sessionToken={sessionToken} collapsed={isCollapsed} />
    </aside>
  );
}
