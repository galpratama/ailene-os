import { ThemeProvider } from "next-themes";
import { Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// The marketing site stays on the pastel brand palette regardless of the
// visitor's system theme — dark mode is an OS-app feature (see the sidebar
// toggle), not a marketing one.
export default function BizLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className={spaceGrotesk.className}>{children}</div>
    </ThemeProvider>
  );
}
