"use client";

import AppButton from "@/components/buttons/AppButton";
import AppCheckbox from "@/components/fields/AppCheckbox";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import type { CreateSignalPayload, SignalSource, SignalType } from "@/apis/signals";
import { createSignal } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { SIGNAL_SOURCE_OPTIONS, SIGNAL_TYPE_OPTIONS } from "@/lib/signals";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

interface CreateSignalFormOSProps {
  onClose: () => void;
}

function blankToNull(value: string) {
  return value.trim() || null;
}

export default function CreateSignalFormOS({ onClose }: CreateSignalFormOSProps) {
  const queryClient = useQueryClient();

  const [type, setType] = useState<SignalType>("hot_lead");
  const [source, setSource] = useState<SignalSource>("manual");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceSnippet, setSourceSnippet] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectJobTitle, setSubjectJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [intentScore, setIntentScore] = useState("");
  const [signalReason, setSignalReason] = useState("");
  const [indonesia, setIndonesia] = useState(true);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (payload: CreateSignalPayload) => requireApiData(await createSignal(payload)),
    onSuccess: async () => {
      toast.success("Signal added.");
      await queryClient.invalidateQueries({ queryKey: ["signals"] });
      onClose();
    },
    onError: (err) => showErrorToast(err, "Failed to add signal."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const score = intentScore.trim() === "" ? null : Number(intentScore);

    if (!sourceUrl.trim()) return setError("Source URL is required.");
    if (type === "hot_lead" && (score === null || !Number.isInteger(score) || score < 0 || score > 10)) {
      return setError("Intent score must be a whole number from 0 to 10.");
    }
    if (type === "warm_account" && (!companyName.trim() || !signalReason.trim())) {
      return setError("Company and reason are required for a warm account.");
    }
    if (type === "decision_maker" && (!subjectName.trim() || !subjectJobTitle.trim() || !companyName.trim())) {
      return setError("Person, job title, and company are required for a decision maker.");
    }

    setError("");
    mutation.mutate({
      type,
      source,
      source_url: sourceUrl.trim(),
      source_title: blankToNull(sourceTitle),
      source_snippet: blankToNull(sourceSnippet),
      subject_name: type === "decision_maker" ? blankToNull(subjectName) : null,
      subject_job_title: type === "decision_maker" ? blankToNull(subjectJobTitle) : null,
      company_name: blankToNull(companyName),
      intent_score: type === "hot_lead" ? score : null,
      indonesia_signal: indonesia,
      signal_reason: blankToNull(signalReason),
    });
  }

  return (
    <SheetOS
      title="Add signal"
      description="Record a lead finding you came across manually."
      isOpen
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
        <AppSelect
          selectId="signal-type"
          label="Type"
          placeholder="Select type"
          value={type}
          options={SIGNAL_TYPE_OPTIONS}
          onChange={(value) => setType(value as SignalType)}
        />
        <AppSelect
          selectId="signal-source"
          label="Source"
          placeholder="Select source"
          value={source}
          options={SIGNAL_SOURCE_OPTIONS}
          onChange={(value) => setSource(value as SignalSource)}
        />
        <AppInput
          inputId="signal-url"
          label="Source URL"
          required
          type="url"
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
          placeholder="https://www.linkedin.com/posts/..."
          characterLength={2048}
        />
        <AppInput
          inputId="signal-title"
          label="Title"
          value={sourceTitle}
          onChange={(event) => setSourceTitle(event.target.value)}
        />
        <AppTextArea
          textAreaId="signal-snippet"
          label="Snippet"
          rows={3}
          value={sourceSnippet}
          onChange={(event) => setSourceSnippet(event.target.value)}
        />
        {type === "decision_maker" && (
          <>
            <AppInput
              inputId="signal-subject-name"
              label="Person"
              required
              value={subjectName}
              onChange={(event) => setSubjectName(event.target.value)}
              characterLength={255}
            />
            <AppInput
              inputId="signal-subject-job"
              label="Job title"
              required
              value={subjectJobTitle}
              onChange={(event) => setSubjectJobTitle(event.target.value)}
              characterLength={255}
            />
          </>
        )}
        <AppInput
          inputId="signal-company"
          label="Company"
          required={type !== "hot_lead"}
          value={companyName}
          onChange={(event) => setCompanyName(event.target.value)}
          characterLength={255}
        />
        {type === "hot_lead" && (
          <AppInput
            inputId="signal-score"
            label="Intent score (0-10)"
            required
            type="number"
            min={0}
            max={10}
            value={intentScore}
            onChange={(event) => setIntentScore(event.target.value)}
          />
        )}
        <AppInput
          inputId="signal-reason"
          label="Reason"
          required={type === "warm_account"}
          value={signalReason}
          onChange={(event) => setSignalReason(event.target.value)}
          characterLength={500}
        />
        <AppCheckbox
          inputId="signal-indonesia"
          label="Indonesia signal"
          checked={indonesia}
          onChange={setIndonesia}
        />

        {error && <p className="text-sm text-merah">{error}</p>}

        <div className="mt-auto flex justify-end gap-2 border-t border-line-soft pt-4">
          <AppButton type="button" variant="outline" size="md" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </AppButton>
          <AppButton type="submit" variant="primary" size="md" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
            Add signal
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
