import GoogleAdsTagBIZ from "@/components/analytics/GoogleAdsTagBIZ";
import MetaPixelBIZ from "@/components/analytics/MetaPixelBIZ";
import { siteProfile } from "@/lib/site";
import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
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
});

// Keep the marketing site on the light brand palette; dark mode belongs to the OS app.
export default function BizLayout({ children }: { children: ReactNode }) {
  const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {/* Third-party image hosts used below the fold; warm the connections early. */}
      <link rel="preconnect" href="https://cdn.simpleicons.org" />
      <link rel="dns-prefetch" href="https://cdn.simpleicons.org" />
      {googleAnalyticsId && <GoogleAnalytics gaId={googleAnalyticsId} />}
      <GoogleAdsTagBIZ />
      <MetaPixelBIZ />
      <div className={stackSansText.className}>{children}</div>
    </ThemeProvider>
  );
}
