"use client";

import AppButton from "@/components/buttons/AppButton";
import { useHeaderActionContext } from "@/contexts/HeaderActionContext";
import { osMainNav, osToolsNav } from "@/lib/os-nav";
import { setSessionToken, trpc } from "@/trpc/client";
import { Bell, ChevronRight, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const breadcrumbNav = [...osMainNav, ...osToolsNav];

const bizLoginURL =
  process.env.NEXT_PUBLIC_DOMAIN_MODE === "local"
    ? "https://biz.example.com:3000/auth/login"
    : "https://biz.ailene.id/auth/login";

function initialsOf(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function AvatarMenu({
  user,
}: {
  user?: { full_name: string; email: string; avatar: string | null };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = bizLoginURL;
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer"
      >
        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt={user.full_name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-claude flex items-center justify-center text-xs font-bold text-white">
            {initialsOf(user?.full_name ?? "?")}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-dashboard-border bg-card-bg shadow-md z-50 overflow-hidden">
          {user && (
            <div className="px-3 py-2.5 border-b border-dashboard-border">
              <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 truncate">
                {user.email}
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            <LogOut size={14} />
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      )}
    </div>
  );
}

export default function HeaderOS({ sessionToken }: { sessionToken: string }) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data } = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const user = data?.user;
  const { action } = useHeaderActionContext();

  const pathname = usePathname();
  const currentNavItem = breadcrumbNav.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  return (
    <header className="h-12 shrink-0 bg-sb-bg border-b border-sb-border flex items-center justify-between px-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-sb-text uppercase tracking-wide">
        <span className="w-2 h-2 rounded-full bg-claude shrink-0" />
        <Link href="/" className="text-sb-text-strong hover:text-claude transition-colors">
          Ailene OS
        </Link>
        {currentNavItem && !currentNavItem.exact && (
          <>
            <ChevronRight size={12} className="text-sb-text" />
            <span className="text-sb-text-strong">{currentNavItem.label}</span>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {action && (
          <AppButton variant="primary" size="sm" onClick={action.onClick}>
            <action.icon size={13} />
            {action.label}
          </AppButton>
        )}

        <AppButton variant="outline" size="icon" className="relative">
          <Bell size={15} />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            3
          </span>
        </AppButton>

        <AvatarMenu user={user} />
      </div>
    </header>
  );
}
