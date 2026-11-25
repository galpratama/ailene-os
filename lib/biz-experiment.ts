import { BIZ_HOME_VARIANT_COOKIE } from "@/lib/constants";

// "a" is the current home (HomePageBIZ), "b" the "Make AI stick." redesign (HomePageV2BIZ).
export const HOME_VARIANTS = ["a", "b"] as const;
export type HomeVariant = (typeof HOME_VARIANTS)[number];

export const HOME_EXPERIMENT_ID = "biz_home_v2";

// Share of new visitors bucketed into "b"; returning visitors keep their cookie.
const HOME_V2_SHARE = 0.5;

export const HOME_VARIANT_MAX_AGE = 60 * 60 * 24 * 90;

function asVariant(value: string | string[] | undefined): HomeVariant | null {
  const key = (Array.isArray(value) ? value[0] : value)?.trim().toLowerCase();
  return HOME_VARIANTS.find((variant) => variant === key) ?? null;
}

// ?home=a|b forces a variant for QA and ad links without changing the visitor's bucket.
export function resolveHomeVariant(
  override: string | string[] | undefined,
  cookie: string | undefined
): { variant: HomeVariant; persist: boolean } {
  const forced = asVariant(override);
  if (forced) return { variant: forced, persist: false };
  const stored = asVariant(cookie);
  if (stored) return { variant: stored, persist: false };
  return { variant: Math.random() < HOME_V2_SHARE ? "b" : "a", persist: true };
}

export function readHomeVariantCookie(): HomeVariant | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${BIZ_HOME_VARIANT_COOKIE}=([^;]*)`));
  return asVariant(match?.[1]);
}
