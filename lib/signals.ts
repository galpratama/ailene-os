import type { AppSelectOption } from "@/components/fields/AppSelect";

export const SIGNAL_TYPE_OPTIONS: AppSelectOption[] = [
  { value: "hot_lead", label: "Hot lead" },
  { value: "warm_account", label: "Warm account" },
  { value: "decision_maker", label: "Decision maker" },
];

export const SIGNAL_STATUS_OPTIONS: AppSelectOption[] = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "converted", label: "Converted" },
  { value: "discarded", label: "Discarded" },
];

export const SIGNAL_SOURCE_OPTIONS: AppSelectOption[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "google", label: "Google" },
  { value: "manual", label: "Manual" },
];

export const SIGNAL_SOURCE_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  google: "Google",
  manual: "Manual",
};
