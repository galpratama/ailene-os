"use client";

import type { NotificationEntityType } from "@/apis/notifications";
import AppButton from "@/components/buttons/AppButton";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Relative to the os.* host, which the rewrite already maps into the /os route group.
const ENTITY_HREF: Record<NotificationEntityType, string> = {
  b2b_pipeline: "/leads",
  b2b_action: "/tasks",
  b2b_meeting: "/calendar",
};

export default function NotificationBellOS({
  sessionToken,
  tone = "light",
}: {
  sessionToken: string;
  // Keep the panel inside the mobile drawer; on desktop it opens beside the sidebar.
  tone?: "light" | "sidebar";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => requireApiData(await getUnreadNotificationCount()),
    enabled: !!sessionToken,
    refetchInterval: 30000,
  });
  const { data: listData } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: async () =>
      requireApiData(await listNotifications({ page: 1, page_size: 10 })),
    enabled: !!sessionToken && isOpen,
  });

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }
  const markRead = useMutation({
    mutationFn: async (id: number) => requireApiData(await markNotificationRead(id)),
    onSuccess: invalidate,
    onError: (error) => showErrorToast(error),
  });
  const markAllRead = useMutation({
    mutationFn: async () => requireApiData(await markAllNotificationsRead()),
    onSuccess: invalidate,
    onError: (error) => showErrorToast(error),
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
      <AppButton
        type="button"
        variant={tone === "sidebar" ? "ghost" : "secondary"}
        size="iconRound"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-merah-t px-1 text-[10px] font-bold text-merah dark:bg-red-500/20 dark:text-red-300">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </AppButton>

      {isOpen && (
        <div className={`z-30 mt-2 overflow-hidden rounded-lg border border-line-soft bg-white shadow-md dark:bg-zinc-800 ${tone === "sidebar" ? "fixed left-3 right-3 top-16 md:absolute md:left-0 md:right-auto md:top-full md:w-80" : "absolute right-0 top-full w-80"}`}>
          <div className="flex items-center justify-between border-b border-line-soft px-3 py-2">
            <p className="text-xs font-semibold text-gray-700 dark:text-zinc-200">
              Notifications
            </p>
            {unreadCount > 0 && (
              <AppButton
                type="button"
                variant="textLink"
                size="textLink"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
              >
                <CheckCheck size={12} /> Mark all read
              </AppButton>
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
                href={
                  n.entity_type === "b2b_action"
                    ? `/tasks/${n.entity_id}`
                    : (ENTITY_HREF[n.entity_type] ?? "/")
                }
                onClick={() => {
                  if (!n.read_at) markRead.mutate(n.id);
                  setIsOpen(false);
                }}
                className={`flex flex-col gap-0.5 border-b border-line-soft px-3 py-2.5 text-xs last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-700/50 ${
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
