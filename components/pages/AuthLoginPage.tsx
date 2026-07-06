"use client";

import AppButton from "@/components/buttons/AppButton";
import { LogoAilene } from "@/components/svg/LogoAilene";
import { useGoogleLogin } from "@react-oauth/google";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const dots = [
  { size: 70, color: "bg-kuning", className: "left-[10%] top-16 opacity-90" },
  { size: 46, color: "bg-pink", className: "right-[14%] top-40" },
  { size: 34, color: "bg-biru", className: "bottom-36 left-[18%]" },
  {
    size: 58,
    color: "bg-hijau",
    className: "bottom-24 right-[16%] opacity-85",
  },
  { size: 26, color: "bg-oranye", className: "left-[28%] top-32" },
];

function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const domain =
    process.env.NEXT_PUBLIC_DOMAIN_MODE === "local"
      ? "biz.example.com:3000"
      : "biz.ailene.id";
  const osRoute =
    process.env.NEXT_PUBLIC_DOMAIN_MODE === "local"
      ? "https://os.example.com:3000"
      : "https://os.ailene.id";

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
          window.location.assign(osRoute);
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
    <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
      <LogoAilene className="h-7 w-auto lg:hidden" />

      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-extrabold text-ink">Welcome back</h1>
        <p className="text-[15px] text-ink-soft">
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

      <p className="text-xs text-ink-soft/70">
        Internal tool for the Ailene team.
      </p>
    </div>
  );
}

export default function AuthLoginPage() {
  return (
    <div className="fixed inset-0 flex bg-white">
      {/* Brand panel (desktop only) */}
      <div className="relative hidden overflow-hidden bg-off lg:flex lg:w-1/2 lg:items-center lg:justify-center">
        {dots.map((dot, i) => (
          <span
            key={i}
            className={`absolute rounded-full ${dot.color} ${dot.className}`}
            style={{ width: dot.size, height: dot.size }}
          />
        ))}

        <div className="relative z-10 flex max-w-100 flex-col items-center gap-5 px-12 text-center">
          <LogoAilene className="h-8 w-auto" />
          <p className="text-[28px] font-extrabold leading-tight text-ink">
            Belajar AI dari nol,{" "}
            <span className="relative whitespace-nowrap">
              <span className="absolute -inset-x-1 bottom-1 -z-10 h-3.5 rounded bg-kuning" />
              gratis
            </span>
            .
          </p>
          <p className="text-sm leading-relaxed text-ink-soft">
            Kurikulum runtut, komunitas ribuan orang, dan sertifikat tiap kelar
            level.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center px-6">
        <LoginForm />
      </div>
    </div>
  );
}
