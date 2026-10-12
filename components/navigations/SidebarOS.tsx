"use client";

import AppButton from "@/components/buttons/AppButton";
import ThemeToggleOS from "@/components/buttons/ThemeToggleOS";
import NotificationBellOS from "@/components/navigations/NotificationBellOS";
import { LogoAilene } from "@/components/svg/LogoAilene";
import { useSession } from "@/contexts/SessionContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { logoutUser } from "@/lib/actions";
import { OSNavItem, OSSegment, osMainNav, osToolsNav } from "@/lib/os-nav";
import { LogOut, LucideIcon, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function segmentClass(active: boolean) {
  return `h-8 flex-1 rounded-lg text-xs transition-colors ${
    active
      ? "bg-sb-tab-active-bg font-semibold text-sb-item-active-text shadow-sm"
      : "font-medium text-sb-text hover:text-sb-text-strong"
  }`;
}

function SidebarBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={collapsed ? "flex w-8 justify-center" : "w-24"}>
      <LogoAilene
        markOnly={collapsed}
        className="h-7 w-auto max-w-none text-sb-text-strong"
      />
    </div>
  );
}

function SegmentToggle({
  segment,
  onChange,
}: {
  segment: OSSegment;
  onChange: (segment: OSSegment) => void;
}) {
  return (
    <div className="flex rounded-xl border border-sb-border-soft bg-sb-tab-track-bg p-0.5">
      <button
        type="button"
        onClick={() => onChange("B2B")}
        aria-pressed={segment === "B2B"}
        className={segmentClass(segment === "B2B")}
      >
        B2B
      </button>
      <button
        type="button"
        onClick={() => onChange("B2C")}
        aria-pressed={segment === "B2C"}
        className={segmentClass(segment === "B2C")}
      >
        B2C
      </button>
    </div>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  collapsed: boolean;
}) {
  const { closeMobileSidebar } = useSidebar();

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      onClick={closeMobileSidebar}
      className={`relative flex min-h-9 items-center rounded-lg text-sm transition-colors ${
        collapsed ? "justify-center px-2" : "px-3"
      } ${
        active
          ? "bg-sb-item-active-bg font-semibold text-sb-item-active-text"
          : "text-sb-text hover:bg-sb-item-hover hover:text-sb-text-strong"
      }`}
    >
      {active && (
        <span aria-hidden="true" className="absolute bottom-2 left-1 top-2 w-0.5 rounded-full bg-claude dark:bg-lime-bright" />
      )}
      <div className="flex min-w-0 items-center gap-3">
        <Icon size={16} className={`shrink-0 ${active ? "text-claude dark:text-lime-bright" : ""}`} />
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

function UserFooter({ collapsed }: { collapsed: boolean }) {
  const user = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logoutUser();
    } finally {
      window.location.href = "/auth/login";
    }
  }

  return (
    <div
      className={`flex shrink-0 items-center border-t border-sb-border-soft ${
        collapsed ? "flex-col gap-2 px-2 py-3" : "gap-2 px-3 py-3"
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
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sb-item-active-bg text-xs font-bold text-sb-text-strong">
          {initialsOf(user?.full_name ?? "?")}
        </div>
      )}
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-sb-text-strong">
            {user?.full_name ?? "Not signed in"}
          </p>
          <p className="truncate text-xs text-sb-text">
            {user?.role === "ADMINISTRATOR" ? "Administrator" : "Member"}
          </p>
        </div>
      )}
      <div className={`flex items-center gap-1 ${collapsed ? "flex-col" : ""}`}>
        <ThemeToggleOS />
        <AppButton
          variant="ghost"
          size="iconRoundSm"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut size={14} />
        </AppButton>
      </div>
    </div>
  );
}

export default function SidebarOS({ sessionToken }: { sessionToken: string }) {
  const role = useSession()?.role;

  const {
    isCollapsed,
    toggleSidebar,
    isMobileOpen,
    closeMobileSidebar,
    toggleMobileSidebar,
  } = useSidebar();
  const pathname = usePathname();
  const collapsed = isCollapsed && !isMobileOpen;

  // Start on B2B to match SSR (no localStorage there); the saved value is read after mount.
  const [segment, setSegment] = useState<OSSegment>("B2B");

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_segment");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "B2B" || saved === "B2C") setSegment(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar_segment", segment);
  }, [segment]);

  const visibleToRole = (item: OSNavItem) =>
    !item.minRoles || (!!role && item.minRoles.includes(role));
  const mainNav = osMainNav.filter(
    (item) => item.segment === segment && visibleToRole(item)
  );
  const toolsNav = osToolsNav.filter(
    (item) => item.segment === segment && visibleToRole(item)
  );

  const activeHref = [...mainNav, ...toolsNav]
    .filter((item) =>
      item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const ungroupedNav = mainNav.filter((item) => !item.group);
  const navGroups = mainNav
    .filter((item) => item.group)
    .reduce<{ label: string; items: OSNavItem[] }[]>((groups, item) => {
      const existing = groups.find((g) => g.label === item.group);
      if (existing) existing.items.push(item);
      else groups.push({ label: item.group!, items: [item] });
      return groups;
    }, []);

  // Close the mobile drawer on any navigation, including browser back/forward.
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
          size="iconRound"
          onClick={toggleMobileSidebar}
          className="fixed left-4 top-4 z-40 shadow-sm md:hidden"
          aria-label="Open menu"
        >
          <Menu size={16} />
        </AppButton>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-sb-border bg-sb-bg transition-transform duration-200 md:sticky md:top-0 md:z-10 md:translate-x-0 md:transition-[width] md:duration-150 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "md:w-16" : "md:w-64"}`}
      >
        {/* The desktop controls stack under the mark when collapsed. */}
        <div
          className={`flex shrink-0 border-b border-sb-border-soft ${
            collapsed
              ? "flex-col items-center gap-3 px-2 py-4"
              : "items-center justify-between gap-2 px-4 py-4"
          }`}
        >
          <SidebarBrand collapsed={collapsed} />

          <div
            className={`flex items-center gap-1 ${collapsed ? "flex-col" : ""}`}
          >
            <NotificationBellOS sessionToken={sessionToken} tone="sidebar" />
            <div className="md:hidden">
              <AppButton
                variant="ghost"
                size="iconRound"
                onClick={closeMobileSidebar}
                aria-label="Close menu"
              >
                <X size={18} />
              </AppButton>
            </div>
            <div className="hidden md:block">
              <AppButton
                variant="ghost"
                size="iconRound"
                onClick={toggleSidebar}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
              </AppButton>
            </div>
          </div>
        </div>

        {/* B2B / B2C segment toggle */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <SegmentToggle segment={segment} onChange={setSegment} />
          </div>
        )}

        {/* Scrollable nav region, footer stays pinned below it */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-6">
          {/* Main nav */}
          <nav className="flex flex-col gap-0.5 px-2 pt-3">
            {ungroupedNav.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={item.href === activeHref}
                collapsed={collapsed}
              />
            ))}
          </nav>

          {/* Grouped nav sections (Business Development, Operations, Administrator, ...) */}
          {navGroups.map((group) => (
            <div
              key={group.label}
              className="mx-2 mt-3 border-t border-sb-border-soft pt-3"
            >
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sb-text">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    active={item.href === activeHref}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Tools */}
          {toolsNav.length > 0 && (
            <div className="mx-2 mt-3 border-t border-sb-border-soft pt-3">
              {!collapsed && (
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sb-text">
                  Tools
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {toolsNav.map((item) => (
                  <NavItem
                    key={item.href}
                    {...item}
                    active={item.href === activeHref}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <UserFooter collapsed={collapsed} />
      </aside>
    </>
  );
}
