import { ThemeProvider } from "next-themes";
import { Caveat, Stack_Sans_Headline } from "next/font/google";
import type { ReactNode } from "react";

const stackSansHeadline = Stack_Sans_Headline({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Script accent font used for "eyebrow" labels and handwritten-style
// callouts on the B2B training landing page (font-script utility).
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caveat",
});

// The marketing site stays on the pastel brand palette regardless of the
// visitor's system theme — dark mode is an OS-app feature (see the sidebar
// toggle), not a marketing one.
export default function BizLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className={`${stackSansHeadline.className} ${caveat.variable}`}>
        {children}
      </div>
    </ThemeProvider>
  );
}
