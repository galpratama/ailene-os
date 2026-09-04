import type { Metadata } from "next";
import type { ReactNode } from "react";

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

// Metadata only: the session gate lives in (protected) so /auth/login can render without one.
export default function OSLayout({ children }: { children: ReactNode }) {
  return children;
}
