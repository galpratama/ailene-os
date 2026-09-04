import AuthLoginPage from "@/components/pages/AuthLoginPage";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";
import { Stack_Sans_Text } from "next/font/google";

// Outside the OS chrome, so it carries its own font and stays on the light brand palette.
const stackSansText = Stack_Sans_Text({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to ailene os",
};

export default function LoginPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className={stackSansText.className}>
        <AuthLoginPage />
      </div>
    </ThemeProvider>
  );
}
