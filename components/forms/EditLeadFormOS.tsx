"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import { B2BProbabilityStatusEnum, B2BStageEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const stageOptions: AppSelectOption[] = [
  { value: "LEAD_IDENTIFIED", label: "Lead Identified" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "VERBAL_COMMIT", label: "Verbal Commit" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
  { value: "ON_HOLD", label: "On Hold" },
];

const probabilityStatusOptions: AppSelectOption[] = [
  { value: "COLD", label: "Cold" },
  { value: "WARM", label: "Warm" },
  { value: "HOT", label: "Hot" },
];

function toMonthInputValue(value: string | Date | null) {
  if (!value) return "";
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
}

interface EditLeadFormOSProps {
  sessionToken: string;
  pipelineId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditLeadFormOS({
  sessionToken,
  pipelineId,
  isOpen,
  onClose,
}: EditLeadFormOSProps) {
  const utils = trpc.useUtils();

  const [companyName, setCompanyName] = useState("");
  const [industryId, setIndustryId] = useState<number | null>(null);
  const [picName, setPicName] = useState("");
  const [picJobTitle, setPicJobTitle] = useState("");
  const [picWa, setPicWa] = useState("");
  const [picEmail, setPicEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [name, setName] = useState("");
  const [stage, setStage] = useState<B2BStageEnum>("LEAD_IDENTIFIED");
  const [probability, setProbability] = useState("");
  const [probabilityStatus, setProbabilityStatus] =
    useState<B2BProbabilityStatusEnum>("COLD");
  const [projectValue, setProjectValue] = useState("");
  const [projectStartMonth, setProjectStartMonth] = useState("");
  const [projectEndMonth, setProjectEndMonth] = useState("");
  const [ownerId, setOwnerId] = useState("");

  const [error, setError] = useState<string | null>(null);

  const { data, isLoading: isLoadingPipeline } = trpc.read.b2b.pipeline.useQuery(
    { id: pipelineId ?? 0 },
    { enabled: !!sessionToken && isOpen && pipelineId != null }
  );

  // Seed the form once per pipeline, adjusting state during render (React's
  // documented pattern for this) rather than in an effect. Reset the seeded
  // marker on close so re-opening the same lead always reverts to its saved
  // values instead of leaving stale in-progress edits behind.
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const [seededPipelineId, setSeededPipelineId] = useState<number | null>(null);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setSeededPipelineId(null);
  }

  const pipeline = data?.pipeline;
  if (isOpen && pipeline && pipeline.id !== seededPipelineId) {
    setSeededPipelineId(pipeline.id);
    setCompanyName(pipeline.company_name);
    setIndustryId(pipeline.industry_id);
    setPicName(pipeline.pic_name ?? "");
    setPicJobTitle(pipeline.pic_job_title ?? "");
    setPicWa(pipeline.pic_wa ?? "");
    setPicEmail(pipeline.pic_email ?? "");
    setImageUrl(pipeline.company_image_url ?? "");
    setName(pipeline.name);
    setStage(pipeline.stage);
    setProbability(String(pipeline.probability));
    setProbabilityStatus(pipeline.probability_status);
    setProjectValue(String(Number(pipeline.project_value)));
    setProjectStartMonth(toMonthInputValue(pipeline.project_start_month));
    setProjectEndMonth(toMonthInputValue(pipeline.project_end_month));
    setOwnerId(pipeline.owner_id);
  }

  const { data: industryData } = trpc.list.industries.useQuery(undefined, {
    enabled: !!sessionToken && isOpen,
  });
  const { data: userData } = trpc.list.users.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken && isOpen }
  );

  const industryOptions: AppSelectOption[] =
    industryData?.list.map((i) => ({ value: i.id, label: i.name })) ?? [];
  const ownerOptions: AppSelectOption[] =
    userData?.list.map((u) => ({ value: u.id, label: u.full_name })) ?? [];

  function handleClose() {
    setError(null);
    onClose();
  }

  const updatePipeline = trpc.update.b2b.pipeline.useMutation();
  const updateCompany = trpc.update.b2b.company.useMutation();
  const isPending = updatePipeline.isPending || updateCompany.isPending;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Program name is required.");
    if (!companyName.trim()) return setError("Company name is required.");
    if (!industryId) return setError("Industry is required.");
    if (!ownerId) return setError("Owner is required.");
    if (pipeline == null) return;

    try {
      await Promise.all([
        updatePipeline.mutateAsync({
          id: pipeline.id,
          name: name.trim(),
          stage,
          probability: probability ? Number(probability) : undefined,
          probability_status: probabilityStatus,
          project_value: projectValue ? Number(projectValue) : undefined,
          project_start_month: projectStartMonth
            ? `${projectStartMonth}-01`
            : null,
          project_end_month: projectEndMonth ? `${projectEndMonth}-01` : null,
          owner_id: ownerId,
        }),
        updateCompany.mutateAsync({
          id: pipeline.company_id,
          name: companyName.trim(),
          industry_id: industryId,
          pic_name: picName.trim() || null,
          pic_job_title: picJobTitle.trim() || null,
          pic_wa: picWa.trim() || null,
          pic_email: picEmail.trim() || null,
          image_url: imageUrl.trim() || null,
        }),
      ]);
      utils.list.b2b.pipelines.invalidate();
      utils.list.b2b.companies.invalidate();
      utils.read.b2b.pipeline.invalidate({ id: pipeline.id });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lead.");
    }
  }

  const isReady = !isLoadingPipeline && !!pipeline;

  return (
    <SheetOS
      title="Edit Lead"
      description="Update this lead's company and pipeline details."
      isOpen={isOpen}
      onClose={handleClose}
    >
      {!isReady ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-gray-400 dark:text-zinc-500" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </p>
            )}

            <AppInput
              inputId="edit-lead-name"
              label="Program Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 AI Bootcamp Sponsorship"
            />

            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Company</p>
              <AppInput
                inputId="edit-lead-company-name"
                label="Company Name"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <AppSelect
                selectId="edit-lead-industry"
                label="Industry"
                required
                placeholder="Pick an industry"
                value={industryId}
                onChange={(v) => setIndustryId(v as number | null)}
                options={industryOptions}
              />
              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  inputId="edit-lead-pic-name"
                  label="PIC Name"
                  value={picName}
                  onChange={(e) => setPicName(e.target.value)}
                />
                <AppInput
                  inputId="edit-lead-pic-job-title"
                  label="PIC Job Title"
                  value={picJobTitle}
                  onChange={(e) => setPicJobTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  inputId="edit-lead-pic-wa"
                  label="PIC WhatsApp"
                  value={picWa}
                  onChange={(e) => setPicWa(e.target.value)}
                />
                <AppInput
                  inputId="edit-lead-pic-email"
                  label="PIC Email"
                  value={picEmail}
                  onChange={(e) => setPicEmail(e.target.value)}
                />
              </div>
              <AppInput
                inputId="edit-lead-company-image-url"
                label="Company Logo URL"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppSelect
                selectId="edit-lead-stage"
                label="Stage"
                placeholder="Pick a stage"
                value={stage}
                onChange={(v) => setStage(v as B2BStageEnum)}
                options={stageOptions}
              />
              <AppSelect
                selectId="edit-lead-probability-status"
                label="Probability Status"
                placeholder="Pick a status"
                value={probabilityStatus}
                onChange={(v) =>
                  setProbabilityStatus(v as B2BProbabilityStatusEnum)
                }
                options={probabilityStatusOptions}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppNumberInput
                inputId="edit-lead-probability"
                label="Probability (%)"
                mode="numeric"
                value={probability}
                onValueChange={setProbability}
                placeholder="0"
              />
              <AppNumberInput
                inputId="edit-lead-project-value"
                label="Project Value (Rp)"
                mode="numeric"
                value={projectValue}
                onValueChange={setProjectValue}
                placeholder="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppInput
                inputId="edit-lead-start-month"
                label="Project Start Month"
                type="month"
                value={projectStartMonth}
                onChange={(e) => setProjectStartMonth(e.target.value)}
              />
              <AppInput
                inputId="edit-lead-end-month"
                label="Project End Month"
                type="month"
                value={projectEndMonth}
                onChange={(e) => setProjectEndMonth(e.target.value)}
              />
            </div>

            <AppSelect
              selectId="edit-lead-owner"
              label="Owner"
              required
              placeholder="Assign an owner"
              value={ownerId}
              onChange={(v) => setOwnerId((v as string) ?? "")}
              options={ownerOptions}
            />
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <AppButton
              type="button"
              variant="outline"
              className="flex-1 justify-center"
              onClick={handleClose}
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              className="flex-1 justify-center"
              disabled={isPending}
            >
              {isPending && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </AppButton>
          </div>
        </form>
      )}
    </SheetOS>
  );
}
