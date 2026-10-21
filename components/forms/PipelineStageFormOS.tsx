"use client";

import type { PipelinePhase, PipelineStageEntry } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { createPipelineStage, updatePipelineStage } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const CODE_PATTERN = /^[a-z][a-z0-9_]{0,39}$/;
const PHASE_OPTIONS = [
  { value: "sdr", label: "SDR · Lead qualification" },
  { value: "bdr", label: "BDR · Deal progression" },
];

function codeFromName(name: string) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40)
    .replace(/_+$/g, "");
}

export default function PipelineStageFormOS({
  stage,
  initialPhase,
  onClose,
  onSaved,
}: {
  stage?: PipelineStageEntry;
  initialPhase: PipelinePhase;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [name, setName] = useState(stage?.name ?? "");
  const [code, setCode] = useState(stage?.code ?? "");
  const [codeEdited, setCodeEdited] = useState(false);
  const [phase, setPhase] = useState<PipelinePhase>(stage?.phase ?? initialPhase);
  const [terminal, setTerminal] = useState(stage?.terminal ?? false);
  const [nameError, setNameError] = useState("");
  const [codeError, setCodeError] = useState("");

  const save = useMutation({
    mutationFn: async () =>
      requireApiData(
        stage
          ? await updatePipelineStage({ code: stage.code, name: name.trim(), terminal })
          : await createPipelineStage({ code, phase, name: name.trim(), terminal }),
      ),
    onSuccess: async () => {
      await onSaved();
      onClose();
    },
    onError: (error) => showErrorToast(error),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextNameError = !name.trim()
      ? "Stage name is required."
      : name.trim().length > 100
        ? "Use 100 characters or fewer."
        : "";
    const nextCodeError = !stage && !CODE_PATTERN.test(code)
      ? "Start with a letter; use lowercase letters, numbers, or underscores (max 40)."
      : "";
    setNameError(nextNameError);
    setCodeError(nextCodeError);
    if (nextNameError || nextCodeError) return;
    save.mutate();
  }

  return (
    <SheetOS
      title={stage ? "Edit pipeline stage" : "Add pipeline stage"}
      description={
        stage
          ? "Rename the stage or change whether it ends a pipeline."
          : "New stages are added at the end of their phase. Drag them into place afterward."
      }
      isOpen
      onClose={onClose}
    >
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <AppInput
            inputId="pipeline-stage-name"
            label="Stage name"
            placeholder="e.g. Proposal sent"
            value={name}
            onChange={(event) => {
              const nextName = event.target.value;
              setName(nextName);
              setNameError("");
              if (!stage && !codeEdited) setCode(codeFromName(nextName));
            }}
            characterLength={100}
            errorMessage={nameError}
            required
          />

          <div className="space-y-1.5">
            <AppInput
              inputId="pipeline-stage-code"
              label="Stage code"
              placeholder="e.g. proposal_sent"
              value={code}
              onChange={(event) => {
                setCodeEdited(true);
                setCode(event.target.value.toLowerCase());
                setCodeError("");
              }}
              characterLength={40}
              errorMessage={codeError}
              readOnly={!!stage}
              required={!stage}
            />
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {stage ? "The code cannot change after creation." : "Generated from the name. It cannot change after creation."}
            </p>
          </div>

          <div className="space-y-1.5">
            <AppSelect
              selectId="pipeline-stage-phase"
              label="Pipeline phase"
              placeholder="Choose a phase"
              value={phase}
              options={PHASE_OPTIONS}
              onChange={(value) => {
                if (value === "sdr" || value === "bdr") setPhase(value);
              }}
              disabled={!!stage}
              required
            />
            {stage && <p className="text-xs text-gray-500 dark:text-zinc-400">The phase cannot change after creation.</p>}
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-line bg-card-bg p-4">
            <input
              type="checkbox"
              checked={terminal}
              onChange={(event) => setTerminal(event.target.checked)}
              disabled={stage?.system}
              className="mt-0.5 size-4 accent-claude"
            />
            <span>
              <span className="block text-sm font-semibold text-gray-900 dark:text-zinc-100">Terminal stage</span>
              <span className="mt-0.5 block text-xs text-gray-500 dark:text-zinc-400">
                A pipeline ends when it reaches this stage. This setting is fixed for built-in stages.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-line-soft px-6 py-4">
          <AppButton type="button" variant="outline" size="sm" onClick={onClose} disabled={save.isPending}>Cancel</AppButton>
          <AppButton type="submit" size="sm" disabled={save.isPending}>
            {save.isPending && <Loader2 size={14} className="animate-spin" />}
            {stage ? "Save changes" : "Add stage"}
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
