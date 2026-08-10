"use client";

import AppButton from "@/components/buttons/AppButton";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface AlertConfirmationOSProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isPending?: boolean;
}

// Small centered confirmation dialog, same visual pattern as StageReasonPromptOS — for a plain confirm/cancel decision rather than picking a value.
export default function AlertConfirmationOS({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  isPending = false,
}: AlertConfirmationOSProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-gray-300 bg-card-bg shadow-xl dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
          <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">
            {title}
          </h2>
        </div>

        <div className="px-5 py-5">
          <p className="text-sm text-gray-500 dark:text-zinc-400">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4 dark:border-zinc-800">
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={onClose}
          >
            {cancelLabel}
          </AppButton>
          <AppButton
            type="button"
            variant={destructive ? "outline" : "primary"}
            size="sm"
            className={
              destructive
                ? "text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/40"
                : undefined
            }
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
