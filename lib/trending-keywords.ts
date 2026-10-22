import type { AppSelectOption } from "@/components/fields/AppSelect";

// Mirrors Seeds in ailene-os-apis/internal/trending/service/trending_service.go; see docs/api/trending.md there.
export const TRENDING_SEED_KEYWORDS = [
  "pelatihan AI",
  "AI untuk bisnis",
  "pelatihan karyawan",
  "corporate training",
] as const;

export const TRENDING_SEED_OPTIONS: AppSelectOption[] = [
  { value: "", label: "All seeds" },
  ...TRENDING_SEED_KEYWORDS.map((seed) => ({ value: seed, label: seed })),
];

export function formatCaptureDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
