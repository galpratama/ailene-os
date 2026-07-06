import { Geist, Geist_Mono } from "next/font/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { TRPCProvider } from "@/trpc/client";
import "./globals.css";

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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ID!}
        >
          <TRPCProvider baseURL={trpcBaseURL}>{children}</TRPCProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
