import SidebarOS from "@/components/navigations/SidebarOS";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import { Jersey_10, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Chunky display font for chrome-level headings (sidebar section labels,
// org selector) — the campus.buildclub.ai-inspired playful accent.
const jersey10 = Jersey_10({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jersey",
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
        <div
          className={`flex h-screen overflow-hidden bg-os-gradient ${spaceGrotesk.className} ${jersey10.variable}`}
        >
          <SidebarOS sessionToken={sessionToken} />
          <div className="flex-1 flex flex-col min-w-0 bg-os-gradient">
            <main className="flex-1 overflow-auto bg-os-gradient bg-geo-pattern">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
