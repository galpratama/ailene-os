"use client";

import type { OutcomeKind, OutcomeReason } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSwitch from "@/components/fields/AppSwitch";
import SheetOS from "@/components/modals/SheetOS";
import { createOutcomeReason, updateOutcomeReason } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { CATALOG_CODE_PATTERN, codeFromName } from "@/lib/catalog-code";
import { showErrorToast } from "@/lib/toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const KIND_COPY: Record<OutcomeKind, string> = {
  disqualified: "Muncul saat lead SDR dipindah ke stage terminal (misalnya Disqualified).",
  lost: "Muncul saat deal BDR dipindah ke stage terminal selain Closed won.",
};

export default function OutcomeReasonFormOS({
  reason,
  kind,
  onClose,
  onSaved,
}: {
  reason?: OutcomeReason;
  kind: OutcomeKind;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [label, setLabel] = useState(reason?.label ?? "");
  const [code, setCode] = useState(reason?.code ?? "");
  const [codeEdited, setCodeEdited] = useState(false);
  const [active, setActive] = useState(reason?.active ?? true);
  const [labelError, setLabelError] = useState("");
  const [codeError, setCodeError] = useState("");

  const save = useMutation({
    mutationFn: async () =>
      requireApiData(
        reason
          ? await updateOutcomeReason({ code: reason.code, label: label.trim(), active })
          : await createOutcomeReason({ code, kind, label: label.trim() })
      ),
    onSuccess: async () => {
      await onSaved();
      onClose();
    },
    onError: (error) => showErrorToast(error),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextLabelError = !label.trim() ? "Label is required." : label.trim().length > 100 ? "Use 100 characters or fewer." : "";
    const nextCodeError = !reason && !CATALOG_CODE_PATTERN.test(code) ? "Start with a letter; use lowercase letters, numbers, or underscores (max 40)." : "";
    setLabelError(nextLabelError);
    setCodeError(nextCodeError);
    if (nextLabelError || nextCodeError) return;
    save.mutate();
  }

  const kindName = kind === "disqualified" ? "disqualify" : "lost";

  return (
    <SheetOS
      title={reason ? `Edit ${kindName} reason` : `Add ${kindName} reason`}
      description={KIND_COPY[kind]}
      isOpen
      onClose={onClose}
    >
      <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <AppInput
            inputId="outcome-reason-label"
            label="Label"
            placeholder={kind === "disqualified" ? "e.g. Tidak ada budget" : "e.g. Memilih kompetitor"}
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
              setLabelError("");
              if (!reason && !codeEdited) setCode(codeFromName(event.target.value));
            }}
            characterLength={100}
            errorMessage={labelError}
            required
          />
          <div className="space-y-1.5">
            <AppInput
              inputId="outcome-reason-code"
              label="Code"
              placeholder="e.g. no_budget"
              value={code}
              onChange={(event) => {
                setCodeEdited(true);
                setCode(event.target.value.toLowerCase());
                setCodeError("");
              }}
              characterLength={40}
              errorMessage={codeError}
              readOnly={!!reason}
              required={!reason}
            />
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              Dipakai di data dan laporan, jadi tidak bisa diubah setelah dibuat.
            </p>
          </div>
          {reason && (
            <AppSwitch
              inputId="outcome-reason-active"
              label="Aktif"
              hint="Alasan nonaktif tidak bisa dipilih lagi, tapi pipeline lama yang memakainya tetap tercatat dan tetap masuk laporan."
              checked={active}
              onChange={setActive}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-line-soft px-6 py-4">
          <AppButton type="button" variant="outline" size="sm" onClick={onClose} disabled={save.isPending}>
            Cancel
          </AppButton>
          <AppButton type="submit" size="sm" disabled={save.isPending}>
            {save.isPending && <Loader2 size={14} className="animate-spin" />}
            {reason ? "Save changes" : "Add reason"}
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
