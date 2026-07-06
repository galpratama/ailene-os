"use client";

import AppButton from "@/components/buttons/AppButton";
import { useSidebar } from "@/contexts/SidebarContext";
import { trpc, setSessionToken } from "@/trpc/client";
import {
  Calendar,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  LayoutGrid,
  LucideIcon,
  Moon,
  Search,
  Settings,
  Sparkles,
  SquareCheckBig,
  Users,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const mainNav: { href: string; label: string; icon: LucideIcon; badge?: number; exact?: boolean }[] = [
  { href: "/", label: "Home", icon: LayoutGrid, exact: true },
  { href: "/leads", label: "Leads · B2B", icon: Users, badge: 11 },
  { href: "/tasks", label: "Tasks", icon: SquareCheckBig, badge: 35 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/trainers", label: "Trainers", icon: GraduationCap, badge: 6 },
  { href: "/module", label: "Module", icon: GraduationCap },
  { href: "/revenue", label: "Revenue", icon: Wallet },
];

const toolsNav: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];

function NavItem({
  href,
  label,
  icon: Icon,
  badge,
  exact,
  collapsed,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
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
        collapsed ? "justify-center px-2 py-2" : "justify-between px-3 py-1.5"
      } ${
        active
          ? "bg-claude/10 text-claude font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      {active && !collapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-claude rounded-full" />
      )}
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={15} className="shrink-0" />
        {!collapsed && <span className="truncate">{label}</span>}
      </div>
      {!collapsed && badge != null && (
        <span className="text-xs text-gray-400 font-medium tabular-nums">
          {badge}
        </span>
      )}
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

  return (
    <div
      className={`mt-auto border-t border-gray-200 flex items-center gap-2.5 ${
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
            <p className="text-sm font-medium text-gray-900 truncate">
              {isLoading ? "Loading..." : (user?.full_name ?? "Not signed in")}
            </p>
            <p className="text-xs text-gray-400 truncate lowercase">
              {user?.role_name ?? ""}
            </p>
          </div>
          <AppButton variant="ghost" size="icon">
            <Moon size={14} />
          </AppButton>
        </>
      )}
    </div>
  );
}

export default function SidebarOS({ sessionToken }: { sessionToken: string }) {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={`shrink-0 bg-white flex flex-col h-screen sticky top-0 border-r border-gray-300 transition-[width] duration-150 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-2.5 pt-5 pb-4 ${
          isCollapsed ? "justify-center px-2" : "px-4"
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-claude flex items-center justify-center shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-gray-900 leading-none truncate">
              Ailene OS
            </span>
            <span className="text-xs text-gray-400 mt-0.5 leading-none">
              INTERNAL HQ
            </span>
          </div>
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
              <span className="text-left font-medium text-gray-800 truncate">
                Ailene Group
              </span>
            )}
          </span>
          {!isCollapsed && (
            <ChevronDown size={13} className="text-gray-400 shrink-0" />
          )}
        </AppButton>
      </div>

      {/* Search */}
      <div className={isCollapsed ? "px-2 pb-2" : "px-3 pb-2"}>
        <AppButton
          variant="outline"
          size="md"
          className={`w-full text-gray-400 ${
            isCollapsed ? "justify-center px-0" : "justify-between"
          }`}
        >
          <span className="flex items-center gap-2">
            <Search size={13} />
            {!isCollapsed && <span className="text-left">Search...</span>}
          </span>
          {!isCollapsed && <span className="text-xs text-gray-400">⌘K</span>}
        </AppButton>
      </div>

      {/* Main nav */}
      <nav className={`flex flex-col gap-0.5 py-1 ${isCollapsed ? "px-2" : "px-2"}`}>
        {mainNav.map((item) => (
          <NavItem key={item.href} {...item} collapsed={isCollapsed} />
        ))}
      </nav>

      {/* Tools */}
      <div className={isCollapsed ? "px-2 mt-3" : "px-2 mt-3"}>
        {!isCollapsed && (
          <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Tools
          </p>
        )}
        <div className="flex flex-col gap-0.5 mt-0.5">
          {toolsNav.map((item) => (
            <NavItem key={item.href} {...item} collapsed={isCollapsed} />
          ))}
        </div>
      </div>

      {/* Collapse toggle */}
      <div className={`mt-2 ${isCollapsed ? "px-2" : "px-2"}`}>
        <AppButton
          variant="ghost"
          size={isCollapsed ? "icon" : "md"}
          className={`w-full ${isCollapsed ? "" : "justify-start"}`}
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
          {!isCollapsed && "Collapse"}
        </AppButton>
      </div>

      <UserFooter sessionToken={sessionToken} collapsed={isCollapsed} />
    </aside>
  );
}
