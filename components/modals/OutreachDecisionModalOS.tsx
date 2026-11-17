"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSwitch from "@/components/fields/AppSwitch";
import AppTextArea from "@/components/fields/AppTextArea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export type OutreachDecision = "approve" | "reject";

// Approving sends a LinkedIn invite through the agent, so it asks about the note; rejecting asks why.
export default function OutreachDecisionModalOS({
  decision,
  count,
  remainingToday,
  isPending,
  onClose,
  onApprove,
  onReject,
}: {
  decision: OutreachDecision | null;
  count: number;
  remainingToday: number | null;
  isPending: boolean;
  onClose: () => void;
  onApprove: (withNote: boolean) => void;
  onReject: (reason: string) => void;
}) {
  const [withNote, setWithNote] = useState(true);
  const [reason, setReason] = useState("");

  const [prevDecision, setPrevDecision] = useState(decision);
  if (decision !== prevDecision) {
    setPrevDecision(decision);
    setWithNote(true);
    setReason("");
  }

  useEffect(() => {
    if (!decision) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [decision]);

  if (!decision) return null;
  const approving = decision === "approve";
  const overQuota = approving && remainingToday !== null && count > remainingToday;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="outreach-decision-title"
        className="flex max-h-full w-full max-w-md flex-col overflow-hidden rounded-2xl border border-line bg-card-bg shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-line-soft px-5 py-4">
          <h2 id="outreach-decision-title" className="text-base font-bold text-gray-900 dark:text-zinc-100">
            {approving ? `Approve ${count} ${count === 1 ? "lead" : "leads"} for invitation?` : `Reject ${count} ${count === 1 ? "lead" : "leads"}?`}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
            {approving
              ? "Agent akan mengirim connection request ke lead yang di-approve pada run berikutnya."
              : "Lead yang di-reject tidak akan dihubungi agent."}
          </p>
        </div>

        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-5 py-4">
          {approving ? (
            <>
              <AppSwitch inputId="outreach-with-note" label="Send with an invite note" hint="Off sends a blank connection request." checked={withNote} onChange={setWithNote} />
              {remainingToday !== null && (
                <p className={`text-xs ${overQuota ? "text-merah" : "text-gray-500 dark:text-zinc-400"}`}>
                  {remainingToday} of today&apos;s approvals left.{overQuota ? ` Only the first ${remainingToday} will be approved; the rest stay as they are.` : ""}
                </p>
              )}
            </>
          ) : (
            <AppTextArea
              textAreaId="outreach-reject-reason"
              label="Reason (optional)"
              rows={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Misalnya: bukan decision maker, di luar ICP"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-line-soft px-5 py-4">
          <AppButton type="button" variant="outline" size="sm" disabled={isPending} onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton
            type="button"
            variant={approving ? "primary" : "destructive"}
            size="sm"
            disabled={isPending || (approving && remainingToday === 0)}
            onClick={() => (approving ? onApprove(withNote) : onReject(reason.trim()))}
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            {approving ? "Approve" : "Reject"}
          </AppButton>
        </div>
      </div>
    </div>
  );
}
