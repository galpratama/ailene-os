"use client";

import { readHomeVariantCookie } from "@/lib/biz-experiment";
import { runAfterLoadIdle } from "@/lib/idle";
import { useEffect } from "react";

// Renders nothing until NEXT_PUBLIC_POSTHOG_KEY is set — safe no-op, never breaks the page.
export default function PostHogBIZ() {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

  useEffect(() => {
    if (!apiKey) return;
    // The SDK and its recorder are heavy, so they wait until the page has loaded and gone idle.
    return runAfterLoadIdle(() => {
      void import("posthog-js").then(({ default: posthog }) => {
        if (posthog.__loaded) return;
        posthog.init(apiKey, {
          api_host: apiHost,
          defaults: "2026-08-30",
          capture_heatmaps: true,
          person_profiles: "identified_only",
        });
        // Every event carries the home A/B bucket so funnels can be split by variant.
        const homeVariant = readHomeVariantCookie();
        if (homeVariant) posthog.register({ home_variant: homeVariant });
      });
    });
  }, [apiKey, apiHost]);

  return null;
}
