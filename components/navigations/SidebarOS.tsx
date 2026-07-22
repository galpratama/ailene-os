"use client";

import AppButton from "@/components/buttons/AppButton";
import ThemeToggleOS from "@/components/buttons/ThemeToggleOS";
import { LogoAileneStroke } from "@/components/svg/LogoAileneStroke";
import { useSidebar } from "@/contexts/SidebarContext";
import { OSSegment, osMainNav, osToolsNav } from "@/lib/os-nav";
import { trpc, setSessionToken } from "@/trpc/client";
import { LogOut, LucideIcon, Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const toolsNav = osToolsNav;

function segmentClass(active: boolean) {
  return `flex-1 h-7 rounded-md text-xs font-semibold transition-colors ${
    active
      ? "bg-claude text-white"
      : "text-sb-text hover:text-sb-text-strong"
  }`;
}

function SegmentToggle({
  segment,
  onChange,
}: {
  segment: OSSegment;
  onChange: (segment: OSSegment) => void;
}) {
  return (
    <div className="flex rounded-lg border border-sb-border-soft bg-sb-item-active-bg p-0.5">
      <button
        type="button"
        onClick={() => onChange("B2B")}
        className={segmentClass(segment === "B2B")}
      >
        B2B
      </button>
      <button
        type="button"
        onClick={() => onChange("B2C")}
        className={segmentClass(segment === "B2C")}
      >
        B2C
      </button>
    </div>
  );
}

const bizLoginURL =
  process.env.NEXT_PUBLIC_DOMAIN_MODE === "local"
    ? "https://biz.example.com:3000/auth/login"
    : "https://biz.ailene.id/auth/login";

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
  const { closeMobileSidebar } = useSidebar();

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={closeMobileSidebar}
      className={`flex items-center rounded-full text-sm transition-colors ${
        collapsed ? "justify-center px-2 py-2" : "px-3 py-1.5"
      } ${
        active
          ? "bg-linear-to-r from-[rgba(37,99,235,0.16)] to-transparent dark:from-[rgba(96,165,250,0.16)] text-sb-item-active-text font-medium"
          : "text-sb-text hover:bg-linear-to-r hover:from-[rgba(37,99,235,0.08)] hover:to-transparent dark:hover:from-[rgba(96,165,250,0.08)] hover:text-sb-text-strong"
      }`}
    >
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
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = bizLoginURL;
    }
  }

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
          <ThemeToggleOS />
          <AppButton
            variant="ghost"
            size="iconSm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-full hover:text-red-600"
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={14} />
          </AppButton>
        </>
      )}
    </div>
  );
}

export default function SidebarOS({ sessionToken }: { sessionToken: string }) {
  const {
    isCollapsed,
    toggleSidebar,
    isMobileOpen,
    closeMobileSidebar,
    toggleMobileSidebar,
  } = useSidebar();
  const pathname = usePathname();

  // Always start on B2B so the client's first render matches the server's
  // (which has no access to localStorage) — read the saved value after mount.
  const [segment, setSegment] = useState<OSSegment>("B2B");

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_segment");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "B2B" || saved === "B2C") setSegment(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar_segment", segment);
  }, [segment]);

  const mainNav = osMainNav.filter((item) => item.segment === segment);

  // Safety net: if navigation ever happens without going through a NavItem's
  // onClick (e.g. browser back/forward), still close the mobile drawer.
  useEffect(() => {
    closeMobileSidebar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile menu trigger — lives outside the aside so it's still
          clickable while the drawer is closed/off-screen. */}
      {!isMobileOpen && (
        <AppButton
          variant="outline"
          size="icon"
          onClick={toggleMobileSidebar}
          className="fixed left-4 top-4 z-40 rounded-full shadow-sm md:hidden"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </AppButton>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-sb-border bg-sb-bg transition-transform duration-200 md:sticky md:top-0 md:z-10 md:translate-x-0 md:transition-[width] md:duration-150 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "md:w-16" : "md:w-64"}`}
      >
        {/* Logo + menu toggle — logo hidden when collapsed, toggle sits to
            its right. Toggle closes the drawer on mobile, collapses/expands
            on desktop. */}
        <div
          className={`flex shrink-0 items-center py-5 pb-7 ${
            isCollapsed ? "justify-center px-2" : "justify-between px-4"
          }`}
        >
          {!isCollapsed && (
            <LogoAileneStroke className="h-12 w-auto shrink-0 -rotate-3 drop-shadow-[1px_1px_0_white]" />
          )}

          <AppButton
            variant="outline"
            size="icon"
            onClick={closeMobileSidebar}
            className="rounded-full md:hidden"
            aria-label="Close menu"
          >
            <Menu size={18} />
          </AppButton>
          <AppButton
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="hidden rounded-full md:flex"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </AppButton>
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
                <span className="font-bold text-left text-sm text-sb-text-strong uppercase truncate">
                  Operating System
                </span>
              )}
            </span>
          </AppButton>
        </div>

        {/* B2B / B2C segment toggle */}
        {!isCollapsed && (
          <div className="px-3 pb-3">
            <SegmentToggle segment={segment} onChange={setSegment} />
          </div>
        )}

        {/* Main nav */}
        <nav
          className={`flex flex-col gap-0.5 py-1 ${isCollapsed ? "px-2" : "px-2"}`}
        >
          {mainNav.map((item) => (
            <NavItem key={item.href} {...item} collapsed={isCollapsed} />
          ))}
        </nav>

        {/* Tools */}
        {toolsNav.length > 0 && (
          <div className={isCollapsed ? "px-2 mt-3" : "px-2 mt-3"}>
            {!isCollapsed && (
              <p className="font-display px-3 py-1 text-sm tracking-wider text-sb-text uppercase">
                Tools
              </p>
            )}
            <div className="flex flex-col gap-0.5 mt-0.5">
              {toolsNav.map((item) => (
                <NavItem key={item.href} {...item} collapsed={isCollapsed} />
              ))}
            </div>
          </div>
        )}

        <UserFooter sessionToken={sessionToken} collapsed={isCollapsed} />
      </aside>
    </>
  );
}
