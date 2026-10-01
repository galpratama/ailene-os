"use client";

import AppButton from "@/components/buttons/AppButton";
import AppSelect from "@/components/fields/AppSelect";
import SignalTypeLabel from "@/components/labels/SignalTypeLabel";
import SheetOS from "@/components/modals/SheetOS";
import type { SignalData, SignalStatus } from "@/apis/signals";
import { updateSignal } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { SIGNAL_SOURCE_LABELS, SIGNAL_STATUS_OPTIONS } from "@/lib/signals";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

interface EditSignalFormOSProps {
  signal: SignalData;
  onClose: () => void;
}

// Only the review status is editable; the finding itself stays as captured.
export default function EditSignalFormOS({ signal, onClose }: EditSignalFormOSProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<SignalStatus>(signal.status);

  const mutation = useMutation({
    // The API replaces every editable field, so the unchanged ones are sent back as stored.
    mutationFn: async () =>
      requireApiData(
        await updateSignal({
          id: signal.id,
          type: signal.type,
          status,
          source: signal.source,
          source_url: signal.source_url,
          source_query: signal.source_query,
          source_title: signal.source_title,
          source_snippet: signal.source_snippet,
          subject_name: signal.subject_name,
          subject_job_title: signal.subject_job_title,
          company_name: signal.company_name,
          intent_score: signal.intent_score,
          indonesia_signal: signal.indonesia_signal,
          signal_reason: signal.signal_reason,
          published_at: signal.published_at,
        })
      ),
    onSuccess: async () => {
      toast.success("Signal status updated.");
      await queryClient.invalidateQueries({ queryKey: ["signals"] });
      onClose();
    },
    onError: (error) => showErrorToast(error, "Failed to update signal."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  const heading =
    signal.type === "decision_maker"
      ? [signal.subject_name, signal.subject_job_title].filter(Boolean).join(" - ")
      : signal.company_name || signal.source_title || signal.source_url;
  const detail = signal.type === "decision_maker" ? signal.company_name : signal.signal_reason;

  return (
    <SheetOS title="Edit signal" description="Move this signal through review." isOpen onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-2 rounded-xl border border-line px-4 py-3">
          <SignalTypeLabel type={signal.type} />
          <p className="font-semibold text-gray-900 dark:text-zinc-100">{heading}</p>
          {detail && <p className="text-sm text-gray-500 dark:text-zinc-400">{detail}</p>}
          <a
            href={signal.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-claude dark:text-zinc-400"
          >
            {SIGNAL_SOURCE_LABELS[signal.source] ?? signal.source}
            <ExternalLink size={11} />
          </a>
        </div>

        <AppSelect
          selectId="signal-status"
          label="Status"
          placeholder="Select status"
          value={status}
          options={SIGNAL_STATUS_OPTIONS}
          onChange={(value) => setStatus(value as SignalStatus)}
        />

        <div className="mt-auto flex justify-end gap-2 border-t border-line-soft pt-4">
          <AppButton type="button" variant="outline" size="md" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            variant="primary"
            size="md"
            disabled={mutation.isPending || status === signal.status}
          >
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Save changes
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
