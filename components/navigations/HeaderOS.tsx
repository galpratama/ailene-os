"use client";

import AppButton from "@/components/buttons/AppButton";
import { useHeaderActionContext } from "@/contexts/HeaderActionContext";
import { osMainNav, osToolsNav } from "@/lib/os-nav";
import { setSessionToken, trpc } from "@/trpc/client";
import { Bell, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const breadcrumbNav = [...osMainNav, ...osToolsNav];

function initialsOf(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
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
    <header className="h-12 shrink-0 bg-white border-b border-gray-300 flex items-center justify-between px-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
        <span className="w-2 h-2 rounded-full bg-claude shrink-0" />
        <Link href="/" className="text-gray-800 hover:text-claude transition-colors">
          Ailene OS
        </Link>
        {currentNavItem && !currentNavItem.exact && (
          <>
            <ChevronRight size={12} className="text-gray-400" />
            <span className="text-gray-800">{currentNavItem.label}</span>
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

        {user?.avatar ? (
          <Image
            src={user.avatar}
            alt={user.full_name}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-claude flex items-center justify-center text-xs font-bold text-white cursor-pointer">
            {initialsOf(user?.full_name ?? "?")}
          </div>
        )}
      </div>
    </header>
  );
}
