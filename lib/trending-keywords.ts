import type { AppSelectOption } from "@/components/fields/AppSelect";

// Mirrors the fixed seeds the API queries Google Trends with; see ailene-os-api docs/api/trending-keywords.md.
export const TRENDING_SEED_KEYWORDS = [
  "pelatihan AI",
  "AI training",
  "corporate training",
  "pelatihan karyawan",
  "AI untuk bisnis",
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
