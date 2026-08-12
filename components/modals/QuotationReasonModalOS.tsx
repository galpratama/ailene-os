"use client";

import AppButton from "@/components/buttons/AppButton";
import AppTextArea from "@/components/fields/AppTextArea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface QuotationReasonModalOSProps {
  isOpen: boolean;
  title: string;
  confirmLabel: string;
  destructive?: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

// Same visual pattern as AlertConfirmationOS, plus a required reason field.
export default function QuotationReasonModalOS({
  isOpen,
  title,
  confirmLabel,
  destructive = false,
  isPending = false,
  onClose,
  onConfirm,
}: QuotationReasonModalOSProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setReason("");
  }

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
          <AppTextArea
            textAreaId="quotation-decision-reason"
            label="Alasan"
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Jelaskan alasannya..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-5 py-4 dark:border-zinc-800">
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={onClose}
          >
            Batal
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
            disabled={isPending || !reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
