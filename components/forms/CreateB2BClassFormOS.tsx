"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

export default function CreateB2BClassFormOS({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [pipelineId, setPipelineId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: pipelineData } = trpc.list.b2b.pipelines.useQuery(
    { page: 1, page_size: 200 },
    { enabled: isOpen }
  );
  const pipelineOptions: AppSelectOption[] =
    pipelineData?.list.map((pipeline) => ({
      value: pipeline.id,
      label: `${pipeline.company_name} · ${pipeline.name}`,
    })) ?? [];

  function close() {
    setName("");
    setPipelineId(null);
    setDescription("");
    setError(null);
    onClose();
  }

  const mutation = trpc.create.b2bClass.class.useMutation({
    onSuccess: () => {
      utils.list.b2bClass.classes.invalidate();
      close();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return setError("Class name is required.");
    }
    mutation.mutate({
      name: name.trim(),
      pipeline_id: pipelineId,
      description: description.trim() || null,
    });
  }

  return (
    <SheetOS
      title="New B2B Class"
      description="Open a class to start scheduling its trainer sessions."
      isOpen={isOpen}
      onClose={close}
    >
      <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
          <AppInput
            inputId="class-name"
            label="Class Name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <AppSelect
            selectId="class-pipeline"
            label="Linked B2B Project (optional)"
            placeholder="No linked project"
            value={pipelineId}
            options={pipelineOptions}
            onChange={(value) => setPipelineId(value as number | null)}
          />
          <AppTextArea
            textAreaId="class-description"
            label="Description"
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="flex gap-3 border-t border-gray-200 px-6 py-4 dark:border-zinc-800">
          <AppButton
            type="button"
            variant="outline"
            className="flex-1 justify-center"
            onClick={close}
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            className="flex-1 justify-center"
            disabled={mutation.isPending}
          >
            {mutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Create Class
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
