"use client";

import { setSessionToken, trpc } from "@/trpc/client";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const ENTITY_HREF: Record<string, string> = {
  B2B_PIPELINE: "/os/leads",
  B2B_ACTION: "/os/tasks",
  B2B_MEETING: "/os/calendar",
};

export default function NotificationBellOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  const { data: countData } = trpc.list.notification.unreadCount.useQuery(
    undefined,
    { enabled: !!sessionToken, refetchInterval: 30000 }
  );
  const { data: listData } = trpc.list.notification.mine.useQuery(
    { page: 1, page_size: 10 },
    { enabled: !!sessionToken && isOpen }
  );

  function invalidate() {
    utils.list.notification.unreadCount.invalidate();
    utils.list.notification.mine.invalidate();
  }
  const markRead = trpc.update.notification.markRead.useMutation({
    onSuccess: invalidate,
  });
  const markAllRead = trpc.update.notification.markAllRead.useMutation({
    onSuccess: invalidate,
  });

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

  const unreadCount = countData?.count ?? 0;
  const notifications = listData?.list ?? [];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex size-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
        aria-label="Notifications"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-merah px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2 dark:border-zinc-700">
            <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="flex items-center gap-1 text-[11px] text-claude hover:underline disabled:opacity-60"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-gray-400">
                No notifications.
              </p>
            )}
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={ENTITY_HREF[n.entity_type] ?? "/os"}
                onClick={() => {
                  if (!n.read_at) markRead.mutate({ id: n.id });
                  setIsOpen(false);
                }}
                className={`flex flex-col gap-0.5 border-b border-gray-100 px-3 py-2.5 text-xs last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-700/50 ${
                  n.read_at
                    ? "text-gray-400"
                    : "text-gray-700 dark:text-zinc-200"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {!n.read_at && (
                    <span className="size-1.5 shrink-0 rounded-full bg-claude" />
                  )}
                  {n.message}
                </span>
                <span className="text-[10px] text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
