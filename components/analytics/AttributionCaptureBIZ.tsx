"use client";

import { captureAttribution } from "@/lib/attribution";
import { useEffect } from "react";

// Records the visitor's first touch (UTMs, click IDs, referrer) once per page load, after hydration.
export default function AttributionCaptureBIZ() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
