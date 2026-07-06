// Shared class-name tokens for the components/fields primitives, so every
// field (input, textarea, number input, select) has the same label/border/
// focus/error treatment instead of six near-identical class strings drifting
// apart over time.

export const fieldLabelClass =
  "flex items-center gap-0.5 pl-1 text-xs font-semibold text-gray-600";

export const fieldErrorClass = "pl-1 text-xs text-red-600";

export const fieldOptionActiveClass = "bg-claude/10 text-claude";

export function fieldInputClass(hasError: boolean) {
  return [
    "w-full rounded-lg border px-3 py-2 text-sm text-gray-900 bg-gray-50 transition placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400",
    hasError
      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
      : "border-gray-300 focus:border-claude focus:ring-claude/30",
  ].join(" ");
}
