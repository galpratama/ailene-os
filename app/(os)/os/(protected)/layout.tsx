import AppToaster from "@/components/elements/AppToaster";
import HeaderOS from "@/components/navigations/HeaderOS";
import SidebarOS from "@/components/navigations/SidebarOS";
import { getRealtimeUrl, sealUnreadNotificationCount } from "@/apis/realtime";
import { getSession } from "@/apis/session";
import { NotificationCountProvider } from "@/contexts/NotificationCountContext";
import { SessionProvider } from "@/contexts/SessionContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { osTypeClassName } from "@/lib/os-fonts";
import { ThemeProvider } from "next-themes";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function OSProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionToken, user } = await getSession();

  // Both roles get in; a rejected token looks like none, so either way the cookie gets dropped first.
  if (!sessionToken || !user) redirect("/auth/clear-session");

  const unreadCountQuery = await sealUnreadNotificationCount(sessionToken);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider user={user}>
        <NotificationCountProvider realtimeUrl={getRealtimeUrl()} sealedQuery={unreadCountQuery}>
          <SidebarProvider>
            <div
              className={`flex h-screen overflow-hidden bg-os-gradient os-font-scope ${osTypeClassName}`}
            >
              <SidebarOS sessionToken={sessionToken} />
              <div className="flex-1 flex flex-col min-w-0 bg-os-gradient">
                <HeaderOS sessionToken={sessionToken} />
                <main className="flex-1 overflow-auto bg-os-gradient bg-geo-pattern">
                  {children}
                </main>
              </div>
            </div>
            <AppToaster />
          </SidebarProvider>
        </NotificationCountProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
