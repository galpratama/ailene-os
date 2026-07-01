import AuthLoginPage from "@/components/pages/AuthLoginPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | ailene os",
  description: "Sign in to ailene os",
};

export default function LoginPage() {
  return <AuthLoginPage />;
}
