"use client";

import type { SessionUser } from "@/apis/session";
import { createContext, useContext, type ReactNode } from "react";

// Resolved once by the protected layout's check-session call, then read by every client component below it.
const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  return (
    <SessionContext.Provider value={user}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
