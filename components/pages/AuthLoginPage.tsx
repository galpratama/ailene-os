"use client";

import { isValidRedirectUrl } from "@/lib/valid-redirect";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const safeRedirect =
    redirectTo && isValidRedirectUrl(redirectTo) ? redirectTo : "/";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const domain =
    process.env.NEXT_PUBLIC_DOMAIN_MODE === "local"
      ? "biz.example.com:3000"
      : "biz.ailene.id";

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `https://${domain}/api/auth/callback/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tokenResponse }),
          }
        );

        if (!response.ok) {
          throw new Error("Login request failed");
        }

        const result = await response.json();
        if (result.status === 200) {
          router.push(safeRedirect);
          router.refresh();
        } else {
          setError("Login failed. Please try again.");
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
    <div className="flex flex-col gap-8 items-center text-center w-full max-w-sm px-8 py-12 bg-white rounded-2xl shadow-sm">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-gray-900">Welcome to ailene os</h1>
        <p className="text-sm text-gray-500">Sign in to continue</p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => login()}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-3 w-full h-10 px-4 text-sm font-semibold rounded-lg border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin text-gray-500" />
          ) : (
            <Image
              src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
              alt="Google"
              width={20}
              height={20}
              className="size-5"
            />
          )}
          <span>Continue with Google</span>
        </button>

        {error && (
          <p className="text-xs text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}

export default function AuthLoginPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
