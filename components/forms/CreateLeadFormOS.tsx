"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import {
  B2BProbabilityStatusEnum,
  B2BProductEnum,
  B2BSourceEnum,
  B2BStageEnum,
} from "@prisma/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const productOptions: AppSelectOption[] = [
  { value: "SPONSORSHIP", label: "Sponsorship" },
  { value: "CORPORATE_TRAINING", label: "Corporate Training" },
  { value: "CORPORATE_AI_TRAINING", label: "Corporate AI Training" },
];

const sourceOptions: AppSelectOption[] = [
  { value: "", label: "None" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "FOUNDER_NETWORK", label: "Founder Network" },
  { value: "EVENT_CONFERENCE", label: "Event / Conference" },
  { value: "REFERRAL_PARTNER", label: "Referral (Partner)" },
  { value: "REFERRAL_CLIENT", label: "Referral (Client)" },
  { value: "WEBSITE", label: "Website" },
];

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
  { value: "", label: "None" },
  { value: "COLD", label: "Cold" },
  { value: "WARM", label: "Warm" },
  { value: "HOT", label: "Hot" },
];

function segmentClass(active: boolean) {
  return `h-7 px-3 rounded-md text-xs font-semibold transition-colors ${
    active ? "bg-claude text-white" : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
  }`;
}

interface CreateLeadFormOSProps {
  sessionToken: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateLeadFormOS({
  sessionToken,
  isOpen,
  onClose,
}: CreateLeadFormOSProps) {
  const utils = trpc.useUtils();

  const [useExistingCompany, setUseExistingCompany] = useState(false);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [industryId, setIndustryId] = useState<number | null>(null);
  const [picName, setPicName] = useState("");
  const [picJobTitle, setPicJobTitle] = useState("");
  const [picWa, setPicWa] = useState("");
  const [picEmail, setPicEmail] = useState("");

  const [name, setName] = useState("");
  const [product, setProduct] = useState<B2BProductEnum | "">("");
  const [source, setSource] = useState<B2BSourceEnum | "">("");
  const [stage, setStage] = useState<B2BStageEnum>("LEAD_IDENTIFIED");
  const [probability, setProbability] = useState("");
  const [probabilityStatus, setProbabilityStatus] = useState<B2BProbabilityStatusEnum | "">("");
  const [projectValue, setProjectValue] = useState("");
  const [projectStartMonth, setProjectStartMonth] = useState("");
  const [projectEndMonth, setProjectEndMonth] = useState("");
  const [ownerId, setOwnerId] = useState("");

  const [error, setError] = useState<string | null>(null);

  const { data: industryData } = trpc.list.industries.useQuery(undefined, {
    enabled: !!sessionToken && isOpen,
  });
  const { data: companyData } = trpc.list.b2b.companies.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken && isOpen }
  );
  const { data: userData } = trpc.list.users.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken && isOpen }
  );

  const companyOptions: AppSelectOption[] =
    companyData?.list.map((c) => ({ value: c.id, label: c.name })) ?? [];
  const industryOptions: AppSelectOption[] =
    industryData?.list.map((i) => ({ value: i.id, label: i.name })) ?? [];
  const ownerOptions: AppSelectOption[] =
    userData?.list.map((u) => ({ value: u.id, label: u.full_name })) ?? [];

  function resetForm() {
    setUseExistingCompany(false);
    setCompanyId(null);
    setCompanyName("");
    setIndustryId(null);
    setPicName("");
    setPicJobTitle("");
    setPicWa("");
    setPicEmail("");
    setName("");
    setProduct("");
    setSource("");
    setStage("LEAD_IDENTIFIED");
    setProbability("");
    setProbabilityStatus("");
    setProjectValue("");
    setProjectStartMonth("");
    setProjectEndMonth("");
    setOwnerId("");
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const createPipeline = trpc.create.b2b.pipeline.useMutation({
    onSuccess: () => {
      utils.list.b2b.pipelines.invalidate();
      if (!useExistingCompany) utils.list.b2b.companies.invalidate();
      handleClose();
    },
    onError: (err) => setError(err.message),
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Program name is required.");
    if (!product) return setError("Product is required.");
    if (!ownerId) return setError("Owner is required.");
    if (useExistingCompany && !companyId) return setError("Pick an existing company.");
    if (!useExistingCompany && !companyName.trim()) return setError("Company name is required.");
    if (!useExistingCompany && !industryId) return setError("Industry is required.");

    createPipeline.mutate({
      name: name.trim(),
      company_id: useExistingCompany ? (companyId as number) : undefined,
      new_company: useExistingCompany
        ? undefined
        : {
            name: companyName.trim(),
            industry_id: industryId as number,
            pic_name: picName.trim() || null,
            pic_job_title: picJobTitle.trim() || null,
            pic_wa: picWa.trim() || null,
            pic_email: picEmail.trim() || null,
          },
      product,
      source: source || undefined,
      stage,
      probability: probability ? Number(probability) : undefined,
      probability_status: probabilityStatus || undefined,
      project_value: projectValue ? Number(projectValue) : undefined,
      project_start_month: projectStartMonth ? `${projectStartMonth}-01` : null,
      project_end_month: projectEndMonth ? `${projectEndMonth}-01` : null,
      owner_id: ownerId,
    });
  }

  return (
    <SheetOS
      title="Add New Lead"
      description="Capture a new B2B lead into the sales pipeline."
      isOpen={isOpen}
      onClose={handleClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col min-h-0">
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}

          <AppInput
            inputId="lead-name"
            label="Program Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Q3 AI Bootcamp Sponsorship"
          />

          {/* Company */}
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Company</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Create a new company or pick an existing one.</p>
              </div>
              <div className="flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setUseExistingCompany(false)}
                  className={segmentClass(!useExistingCompany)}
                >
                  New
                </button>
                <button
                  type="button"
                  onClick={() => setUseExistingCompany(true)}
                  className={segmentClass(useExistingCompany)}
                >
                  Existing
                </button>
              </div>
            </div>

            {useExistingCompany ? (
              <AppSelect
                selectId="lead-company"
                label="Company"
                required
                placeholder="Pick a company"
                value={companyId}
                onChange={(v) => setCompanyId(v as number | null)}
                options={companyOptions}
              />
            ) : (
              <div className="flex flex-col gap-3">
                <AppInput
                  inputId="lead-company-name"
                  label="Company Name"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. PT Sumber Makmur"
                />
                <AppSelect
                  selectId="lead-industry"
                  label="Industry"
                  required
                  placeholder="Pick an industry"
                  value={industryId}
                  onChange={(v) => setIndustryId(v as number | null)}
                  options={industryOptions}
                />
                <div className="grid grid-cols-2 gap-3">
                  <AppInput
                    inputId="lead-pic-name"
                    label="PIC Name"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                  />
                  <AppInput
                    inputId="lead-pic-job-title"
                    label="PIC Job Title"
                    value={picJobTitle}
                    onChange={(e) => setPicJobTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <AppInput
                    inputId="lead-pic-wa"
                    label="PIC WhatsApp"
                    value={picWa}
                    onChange={(e) => setPicWa(e.target.value)}
                  />
                  <AppInput
                    inputId="lead-pic-email"
                    label="PIC Email"
                    value={picEmail}
                    onChange={(e) => setPicEmail(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AppSelect
              selectId="lead-product"
              label="Product"
              required
              placeholder="Pick a product"
              value={product}
              onChange={(v) => setProduct(v as B2BProductEnum)}
              options={productOptions}
            />
            <AppSelect
              selectId="lead-source"
              label="Source"
              placeholder="Pick a source"
              value={source}
              onChange={(v) => setSource(v as B2BSourceEnum | "")}
              options={sourceOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AppSelect
              selectId="lead-stage"
              label="Stage"
              placeholder="Pick a stage"
              value={stage}
              onChange={(v) => setStage(v as B2BStageEnum)}
              options={stageOptions}
            />
            <AppSelect
              selectId="lead-probability-status"
              label="Probability Status"
              placeholder="Pick a status"
              value={probabilityStatus}
              onChange={(v) => setProbabilityStatus(v as B2BProbabilityStatusEnum | "")}
              options={probabilityStatusOptions}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AppNumberInput
              inputId="lead-probability"
              label="Probability (%)"
              mode="numeric"
              value={probability}
              onValueChange={setProbability}
              placeholder="0"
            />
            <AppNumberInput
              inputId="lead-project-value"
              label="Project Value (Rp)"
              mode="numeric"
              value={projectValue}
              onValueChange={setProjectValue}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AppInput
              inputId="lead-start-month"
              label="Project Start Month"
              type="month"
              value={projectStartMonth}
              onChange={(e) => setProjectStartMonth(e.target.value)}
            />
            <AppInput
              inputId="lead-end-month"
              label="Project End Month"
              type="month"
              value={projectEndMonth}
              onChange={(e) => setProjectEndMonth(e.target.value)}
            />
          </div>

          <AppSelect
            selectId="lead-owner"
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
            disabled={createPipeline.isPending}
          >
            {createPipeline.isPending && <Loader2 size={14} className="animate-spin" />}
            Create Lead
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
