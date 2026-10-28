"use client";

import type { LmsProjectEntry, UpdateLmsProjectPayload } from "@/apis/lms";
import AppButton from "@/components/buttons/AppButton";
import CompanyLogoUploadOS from "@/components/fields/CompanyLogoUploadOS";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import {
  createLmsProject,
  deleteLmsProject,
  updateLmsProject,
} from "@/lib/actions";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

type FormValues = {
  name: string;
  attendeePax: string;
  companyName: string;
  companyImageUrl: string;
};

function valuesOf(project: LmsProjectEntry | null): FormValues {
  return {
    name: project?.name ?? "",
    attendeePax: project?.attendee_pax?.toString() ?? "",
    companyName: project?.company_name ?? "",
    companyImageUrl: project?.company_image_url ?? "",
  };
}

function optionalText(value: string) {
  return value.trim() || null;
}

export default function LmsProjectFormOS({
  project,
  isOpen,
  onClose,
  onSaved,
  onDeleted,
}: {
  project: LmsProjectEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (project: LmsProjectEntry) => void;
  onDeleted?: () => void;
}) {
  const queryClient = useQueryClient();
  const [seenProject, setSeenProject] = useState(project);
  const [values, setValues] = useState<FormValues>(() => valuesOf(project));
  const [nameError, setNameError] = useState("");
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (project !== seenProject) {
    setSeenProject(project);
    setValues(valuesOf(project));
    setNameError("");
  }

  function setValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function close() {
    if (isLogoUploading) return;
    setValues(valuesOf(project));
    setNameError("");
    onClose();
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const attendeePax = values.attendeePax ? Number(values.attendeePax) : null;

      if (!project) {
        return requireApiData(
          await createLmsProject({
            name: values.name.trim(),
            attendee_pax: attendeePax,
            company_name: optionalText(values.companyName),
            company_image_url: optionalText(values.companyImageUrl),
          }),
        );
      }

      const original = valuesOf(project);
      const payload: UpdateLmsProjectPayload = { project_id: project.id };
      if (values.name.trim() !== original.name) payload.name = values.name.trim();
      if (values.attendeePax !== original.attendeePax) payload.attendee_pax = attendeePax;
      if (values.companyName.trim() !== original.companyName) {
        payload.company_name = optionalText(values.companyName);
      }
      if (values.companyImageUrl.trim() !== original.companyImageUrl) {
        payload.company_image_url = optionalText(values.companyImageUrl);
      }

      if (Object.keys(payload).length === 1) return project;
      return requireApiData(await updateLmsProject(payload));
    },
    onSuccess: async (savedProject) => {
      await queryClient.invalidateQueries({ queryKey: ["lms-projects"] });
      toast.success(project ? "Project updated." : "Project created.");
      onSaved?.(savedProject);
      close();
    },
    onError: (error) => showErrorToast(error, "Failed to save project."),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!project) return;
      requireApiSuccess(await deleteLmsProject({ project_id: project.id }));
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lms-projects"] });
      toast.success("Project deleted.");
      setIsConfirmingDelete(false);
      onDeleted?.();
      close();
    },
    onError: (error) => showErrorToast(error, "Failed to delete project."),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isLogoUploading) {
      return showErrorToast("Please wait for the logo upload to finish.");
    }
    const nextNameError = values.name.trim() ? "" : "Project name is required.";
    setNameError(nextNameError);
    if (nextNameError) return;
    saveMutation.mutate();
  }

  return (
    <>
      <SheetOS
        title={project ? "Edit project" : "New project"}
        description={
          project
            ? "Update the learning project and its company details."
            : "Set up a new learning project for a company."
        }
        isOpen={isOpen}
        onClose={close}
      >
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
            <AppInput
              inputId="lms-project-name"
              label="Project name"
              required
              characterLength={255}
              value={values.name}
              errorMessage={nameError}
              onChange={(event) => setValue("name", event.target.value)}
              placeholder="e.g. AI Leadership Academy"
            />
            <AppNumberInput
              inputId="lms-project-attendee-pax"
              label="Attendee capacity"
              min={0}
              value={values.attendeePax}
              onValueChange={(value) => setValue("attendeePax", value)}
              placeholder="e.g. 25"
            />

            <div className="my-1 border-t border-line-soft" />

            <CompanyLogoUploadOS
              inputId="lms-project-company-logo"
              value={values.companyImageUrl}
              onChange={(value) => setValue("companyImageUrl", value)}
              onBusyChange={setIsLogoUploading}
              disabled={saveMutation.isPending || deleteMutation.isPending}
            />
            <AppInput
              inputId="lms-project-company-name"
              label="Company name"
              characterLength={255}
              value={values.companyName}
              onChange={(event) => setValue("companyName", event.target.value)}
              placeholder="e.g. Hutama Karya"
            />
          </div>

          <div className="flex items-center gap-3 border-t border-line-soft px-6 py-4">
            {project && (
              <AppButton
                type="button"
                variant="dangerGhost"
                size="icon"
                title="Delete project"
                disabled={isLogoUploading}
                onClick={() => setIsConfirmingDelete(true)}
              >
                <Trash2 size={14} />
              </AppButton>
            )}
            <div className="flex flex-1 justify-end gap-3">
              <AppButton
                type="button"
                variant="outline"
                disabled={isLogoUploading}
                onClick={close}
              >
                Cancel
              </AppButton>
              <AppButton
                type="submit"
                disabled={saveMutation.isPending || isLogoUploading}
              >
                {saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                {project ? "Save changes" : "Create project"}
              </AppButton>
            </div>
          </div>
        </form>
      </SheetOS>

      <AlertConfirmationOS
        isOpen={isConfirmingDelete}
        onClose={() => setIsConfirmingDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete project?"
        message={`Delete "${project?.name ?? "this project"}"? It will disappear from LMS administration, but its data will be retained.`}
        confirmLabel="Delete project"
        destructive
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
