"use client";

import AppButton from "@/components/buttons/AppButton";
import { LogoAilene } from "@/components/svg/LogoAilene";
import { loginWithGoogle } from "@/lib/actions";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Hairline that fades at both ends — the main thing selling the glass edge.
function EdgeLine({ className }: { className: string }) {
  return <span className={`pointer-events-none absolute ${className}`} />;
}

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await loginWithGoogle(tokenResponse.access_token);
        if (result.success) {
          window.location.assign("/");
        } else {
          setError(result.message ?? "Login failed. Please try again.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("Google login was cancelled or failed.");
    },
  });

  return (
    <div className="relative w-full max-w-100">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-7 py-9 shadow-2xl shadow-black/60 backdrop-blur-xl sm:px-9 sm:py-10">
        <EdgeLine className="inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <EdgeLine className="inset-y-0 left-0 w-px bg-gradient-to-b from-white/25 via-transparent to-transparent" />
        <EdgeLine className="inset-y-0 right-0 w-px bg-gradient-to-b from-white/25 via-transparent to-transparent" />
        <EdgeLine className="inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

        <div className="relative flex flex-col items-center gap-8 text-center">
          <LogoAilene variant="white" className="h-7 w-auto" />

          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-extrabold text-white">Welcome back</h1>
            <p className="text-[15px] text-white/55">
              Sign in to your Ailene OS account
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <AppButton
              type="button"
              variant="white"
              size="cta"
              className="w-full justify-center"
              onClick={() => login()}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin text-ink-soft" />
              ) : (
                <Image
                  src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
                  alt="Google"
                  width={20}
                  height={20}
                  className="size-5"
                />
              )}
              Continue with Google
            </AppButton>

            {error && <p className="text-xs text-merah">{error}</p>}
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-white/35">
        Internal tool for the Ailene team.
      </p>
    </div>
  );
}

export default function AuthLoginPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-black px-4">
      <div className="pointer-events-none absolute inset-0 bg-auth-grid" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-150 -translate-x-1/2 -translate-y-1/2 rounded-full bg-claude/12 blur-[120px]" />

      <LoginForm />
    </div>
  );
}
