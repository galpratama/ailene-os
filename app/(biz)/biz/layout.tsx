import GoogleAdsTagBIZ from "@/components/analytics/GoogleAdsTagBIZ";
import MetaPixelBIZ from "@/components/analytics/MetaPixelBIZ";
import { ThemeProvider } from "next-themes";
import { Stack_Sans_Text } from "next/font/google";
import type { ReactNode } from "react";

const stackSansText = Stack_Sans_Text({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Keep the marketing site on the light brand palette; dark mode belongs to the OS app.
export default function BizLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <GoogleAdsTagBIZ />
      <MetaPixelBIZ />
      <div className={stackSansText.className}>{children}</div>
    </ThemeProvider>
  );
}
