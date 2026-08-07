import AppToaster from "@/components/elements/AppToaster";
import SidebarOS from "@/components/navigations/SidebarOS";
import AppPageState from "@/components/states/AppPageState";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { setSessionToken, trpc } from "@/trpc/server";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import { Stack_Sans_Headline } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

// Single OS-wide typeface; os-font-scope (globals.css) points every other font-* utility at this same variable.
const stackSans = Stack_Sans_Headline({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-stack",
});

export const metadata: Metadata = {
  title: {
    default: "Ailene OS",
    template: "%s | Ailene OS",
  },
  description:
    "Internal operating system for managing Ailene leads, tasks, calendar, revenue, and team workflows.",
  applicationName: "Ailene OS",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OSLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "";

  if (!sessionToken) return null;
  setSessionToken(sessionToken);

  const checkUser = (await trpc.auth.checkSession()).user;

  if (!checkUser || checkUser.role_name === "General User") {
    return <AppPageState variant="FORBIDDEN" />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div
          className={`flex h-screen overflow-hidden bg-os-gradient os-font-scope ${stackSans.className} ${stackSans.variable}`}
        >
          <SidebarOS sessionToken={sessionToken} />
          <div className="flex-1 flex flex-col min-w-0 bg-os-gradient">
            <main className="flex-1 overflow-auto bg-os-gradient bg-geo-pattern">
              {children}
            </main>
          </div>
        </div>
        <AppToaster />
      </SidebarProvider>
    </ThemeProvider>
  );
}
