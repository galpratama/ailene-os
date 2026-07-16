"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

export default function CreateLmsProjectFormOS({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [attendeePax, setAttendeePax] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: companyData } = trpc.list.b2b.companies.useQuery(
    { page: 1, page_size: 200 },
    { enabled: isOpen }
  );
  const companyOptions: AppSelectOption[] =
    companyData?.list.map((company) => ({
      value: company.id,
      label: company.name,
    })) ?? [];

  function close() {
    setName("");
    setCompanyId(null);
    setAttendeePax("");
    setError(null);
    onClose();
  }

  const mutation = trpc.create.lms.project.useMutation({
    onSuccess: () => {
      utils.list.lms.projects.invalidate();
      close();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      return setError("Project name is required.");
    }
    mutation.mutate({
      name: name.trim(),
      company_id: companyId,
      attendee_pax: attendeePax.trim() ? Number(attendeePax) : null,
    });
  }

  return (
    <SheetOS
      title="New Project"
      description="A project scopes groups and members to a B2B client."
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
            inputId="lms-project-name"
            label="Project Name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <AppSelect
            selectId="lms-project-company"
            label="Linked B2B Company (optional)"
            placeholder="No linked company"
            value={companyId}
            options={companyOptions}
            onChange={(value) => setCompanyId(value as number | null)}
          />
          <AppInput
            inputId="lms-project-attendee-pax"
            label="Attendee Pax"
            type="number"
            min={1}
            value={attendeePax}
            onChange={(event) => setAttendeePax(event.target.value)}
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
            Create Project
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
