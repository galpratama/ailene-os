import AppToaster from "@/components/elements/AppToaster";
import GoogleTagBIZ from "@/components/analytics/GoogleTagBIZ";
import MetaPixelBIZ from "@/components/analytics/MetaPixelBIZ";
import MicrosoftClarityBIZ from "@/components/analytics/MicrosoftClarityBIZ";
import PostHogBIZ from "@/components/analytics/PostHogBIZ";
import { siteProfile } from "@/lib/site";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import { Stack_Sans_Text } from "next/font/google";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: `${siteProfile.name} | ${siteProfile.tagline}`,
    template: `%s | ${siteProfile.name}`,
  },
  description: siteProfile.description,
  applicationName: siteProfile.name,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: siteProfile.name,
    locale: siteProfile.locale,
    images: [
      {
        url: "/biz/hero-training.jpg",
        width: 1400,
        height: 700,
        alt: "Sesi AI adoption training Ailene bersama tim perusahaan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/biz/hero-training.jpg"],
  },
};

const stackSansText = Stack_Sans_Text({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-stack-sans-text",
});

// Latin-subset woff2, only used by below-the-fold eyebrows, so it isn't preloaded against the hero.
const crayonize = localFont({
  src: "../../../public/fonts/crayonize-bold.woff2",
  variable: "--font-crayonize",
  display: "swap",
  weight: "700",
  preload: false,
});

// Keep the marketing site on the light brand palette; dark mode belongs to the OS app.
export default function BizLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {/* Third-party image hosts used below the fold; warm the connections early. */}
      <link rel="preconnect" href="https://cdn.simpleicons.org" />
      <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />
      {/* Every tag below loads after the page is idle, keeping them off the first paint and hydration. */}
      <GoogleTagBIZ />
      <MetaPixelBIZ />
      <MicrosoftClarityBIZ />
      <PostHogBIZ />
      <div className={`${stackSansText.className} ${stackSansText.variable} ${crayonize.variable}`}>
        {children}
      </div>
      <AppToaster />
    </ThemeProvider>
  );
}
