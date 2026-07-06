import HeaderOS from "@/components/navigations/HeaderOS";
import SidebarOS from "@/components/navigations/SidebarOS";
import { HeaderActionProvider } from "@/contexts/HeaderActionContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <HeaderActionProvider>
          <div
            className={`flex h-screen overflow-hidden bg-dashboard-bg ${spaceGrotesk.className}`}
          >
            <SidebarOS sessionToken={sessionToken} />
            <div className="flex-1 flex flex-col min-w-0 bg-dashboard-bg">
              <HeaderOS sessionToken={sessionToken} />
              <main className="flex-1 overflow-auto bg-dashboard-bg">
                {children}
              </main>
            </div>
          </div>
        </HeaderActionProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
