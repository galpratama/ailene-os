"use client";

import type { UnreadNotificationCountRow } from "@/apis/realtime";
import { getUnreadNotificationCount } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type UnreadCountQuery = SealedLiveQuery<UnreadNotificationCountRow>;

const NotificationCountContext = createContext(0);

async function renewUnreadCountQuery(): Promise<UnreadCountQuery> {
  const response = await fetch("/api/realtime/notifications", { method: "POST", cache: "no-store" });
  if (!response.ok) throw new Error(`Realtime renewal failed with ${response.status}`);
  return response.json();
}

function LiveCount({
  query,
  onCount,
  onFailed,
}: {
  query: UnreadCountQuery;
  onCount: (count: number) => void;
  onFailed: () => void;
}) {
  // Keep the first capability; a server re-render must not restart the subscription.
  const [initialQuery] = useState(query);
  const { data, status } = useLiveQuery(initialQuery, { refreshQuery: renewUnreadCountQuery });
  const count = data?.[0]?.count;
  useEffect(() => {
    if (count !== undefined) onCount(count);
  }, [count, onCount]);
  useEffect(() => {
    if (status === "error") onFailed();
  }, [status, onFailed]);
  return null;
}

// Without Realtime the count loads once and again on window focus, never on a timer.
function FetchedCount({ onCount }: { onCount: (count: number) => void }) {
  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => requireApiData(await getUnreadNotificationCount()),
  });
  const count = data?.count;
  useEffect(() => {
    if (count !== undefined) onCount(count);
  }, [count, onCount]);
  return null;
}

export function NotificationCountProvider({
  realtimeUrl,
  sealedQuery,
  children,
}: {
  realtimeUrl: string | undefined;
  sealedQuery: UnreadCountQuery | null;
  children: ReactNode;
}) {
  const queryClient = useQueryClient();
  const [client] = useState(() => (realtimeUrl ? createRealtimeClient({ url: realtimeUrl }) : null));
  const [failed, setFailed] = useState(false);
  const [count, setCount] = useState(0);
  const handleFailed = useCallback(() => setFailed(true), []);

  // A changed count means the open panel is stale; invalidation only refetches it while it is shown.
  const previous = useRef(count);
  useEffect(() => {
    if (previous.current === count) return;
    previous.current = count;
    void queryClient.invalidateQueries({ queryKey: ["notifications", "list"] });
  }, [count, queryClient]);

  // The source sits beside children, so falling back from Realtime never remounts the page.
  return (
    <NotificationCountContext.Provider value={count}>
      {client && sealedQuery && !failed ? (
        <RealtimeProvider client={client}>
          <LiveCount query={sealedQuery} onCount={setCount} onFailed={handleFailed} />
        </RealtimeProvider>
      ) : (
        <FetchedCount onCount={setCount} />
      )}
      {children}
    </NotificationCountContext.Provider>
  );
}

export function useUnreadNotificationCount() {
  return useContext(NotificationCountContext);
}
