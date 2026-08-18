"use client";

import NotificationBellOS from "@/components/navigations/NotificationBellOS";
import { setSessionToken, trpc } from "@/trpc/client";
import Image from "next/image";
import { useEffect } from "react";

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

  return (
    <header className="flex h-14 shrink-0 items-center justify-end gap-3 border-b border-gray-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
      <NotificationBellOS sessionToken={sessionToken} />
      {user?.avatar ? (
        <Image
          src={user.avatar}
          alt={user.full_name}
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-claude text-xs font-bold text-white">
          {user ? initialsOf(user.full_name) : ""}
        </div>
      )}
    </header>
  );
}
