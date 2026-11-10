"use client";

import type { OutcomeKind } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import AppTextArea from "@/components/fields/AppTextArea";
import { useOutcomeReasons } from "@/hooks/useOutcomeReasons";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

// Asked when a card is dropped on a disqualify or lost stage, since the API refuses that move without a reason.
export default function OutcomeReasonModalOS({
  isOpen,
  kind,
  companyName,
  stageName,
  isPending = false,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  kind: OutcomeKind | null;
  companyName: string;
  stageName: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: (reasonCode: string, note: string | null) => void;
}) {
  const reasons = useOutcomeReasons(isOpen);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setReason("");
      setNote("");
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !kind) return null;
  const options = reasons.optionsFor(kind);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="outcome-reason-title"
        className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-card-bg shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-line-soft px-5 py-4">
          <h2 id="outcome-reason-title" className="text-base font-bold text-gray-900 dark:text-zinc-100">
            {kind === "disqualified" ? "Kenapa lead ini di-disqualify?" : "Kenapa deal ini kalah?"}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            {companyName} → {stageName}
          </p>
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 py-4">
          {reasons.isLoading ? (
            <Loader2 size={18} className="mx-auto animate-spin text-gray-400" aria-label="Memuat alasan" />
          ) : (
            <fieldset className="flex flex-col gap-1.5">
              <legend className="sr-only">Alasan</legend>
              {options.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    reason === option.value
                      ? "border-claude bg-claude/5 text-gray-900 dark:text-zinc-100"
                      : "border-line text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="outcome-reason"
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                    className="accent-claude"
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
          )}
          <AppTextArea
            textAreaId="outcome-reason-note"
            label="Catatan (opsional)"
            rows={2}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Konteks tambahan, masuk ke riwayat stage"
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line-soft px-5 py-4">
          <AppButton type="button" variant="outline" size="sm" disabled={isPending} onClick={onClose}>
            Batal
          </AppButton>
          <AppButton
            type="button"
            variant="primary"
            size="sm"
            disabled={isPending || !reason}
            onClick={() => onConfirm(reason, note.trim() || null)}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Pindahkan
          </AppButton>
        </div>
      </div>
    </div>
  );
}
