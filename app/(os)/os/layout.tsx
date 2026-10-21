import QueryProvider from "@/contexts/QueryProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Ailene OS",
    template: "%s | Ailene OS",
  },
  description:
    "Internal operating system for managing Ailene leads, tasks, revenue, and team workflows.",
  applicationName: "Ailene OS",
  robots: {
    index: false,
    follow: false,
  },
};

// The session gate lives in (protected) so /auth/login can render without one; the providers stay here so biz never ships them.
export default function OSLayout({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ID!}>
      <QueryProvider>{children}</QueryProvider>
    </GoogleOAuthProvider>
  );
}
