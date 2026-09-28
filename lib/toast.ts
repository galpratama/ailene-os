import { toast } from "sonner";

// Accepts a caught error or a plain message, so every failure path reports through the same toast.
export function showErrorToast(cause: unknown, fallback = "Something went wrong.") {
  const message =
    typeof cause === "string"
      ? cause
      : cause instanceof Error && cause.message
        ? cause.message
        : fallback;
  toast.error(message);
}
