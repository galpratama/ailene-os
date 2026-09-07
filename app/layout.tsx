import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { TRPCProvider } from "@/trpc/client";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  // Lets every page express canonical/OG URLs as plain paths.
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const trpcBaseURL =
  process.env.DOMAIN_MODE === "local"
    ? "https://api.example.com:3000/trpc"
    : "https://api.ailene.id/trpc";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Single container for every sub-app; renders nothing until BD/Marketing supplies the ID.
  const googleTagManagerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      {googleTagManagerId && <GoogleTagManager gtmId={googleTagManagerId} />}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* GoogleTagManager only emits the <head> script, so the no-JS fallback is hand-written here. */}
        {googleTagManagerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ID!}
        >
          <TRPCProvider baseURL={trpcBaseURL}>{children}</TRPCProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
