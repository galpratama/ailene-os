import AppToaster from "@/components/elements/AppToaster";
import AuthLoginPage from "@/components/pages/AuthLoginPage";
import { osTypeClassName } from "@/lib/os-fonts";
import { ThemeProvider } from "next-themes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to ailene os",
};

// Outside the OS chrome, so it carries its own type and stays on the light brand palette.
export default function LoginPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className={osTypeClassName}>
        <AuthLoginPage />
      </div>
      <AppToaster />
    </ThemeProvider>
  );
}
