import AppToaster from "@/components/elements/AppToaster";
import HeaderOS from "@/components/navigations/HeaderOS";
import SidebarOS from "@/components/navigations/SidebarOS";
import { getSession } from "@/apis/session";
import { SessionProvider } from "@/contexts/SessionContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { setSessionToken } from "@/trpc/server";
import { ThemeProvider } from "next-themes";
import { Stack_Sans_Headline } from "next/font/google";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

// Single OS-wide typeface; os-font-scope (globals.css) points every other font-* utility at this same variable.
const stackSans = Stack_Sans_Headline({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-stack",
});

export default async function OSProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { sessionToken, user } = await getSession();

  // Both roles get in; a rejected token looks like none, so either way the cookie gets dropped first.
  if (!sessionToken || !user) redirect("/auth/clear-session");

  // The rest of the app still talks tRPC, which reads the same JWT row out of `tokens`.
  setSessionToken(sessionToken);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider user={user}>
        <SidebarProvider>
          <div
            className={`flex h-screen overflow-hidden bg-os-gradient os-font-scope ${stackSans.className} ${stackSans.variable}`}
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
      </SessionProvider>
    </ThemeProvider>
  );
}
