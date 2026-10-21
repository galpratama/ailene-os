"use client";

import type {
  LeadChannel,
  LeadSource,
  PipelineData,
  PipelineStage,
} from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import CompanyLogoUploadOS from "@/components/fields/CompanyLogoUploadOS";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import RecordTimelineOS from "@/components/elements/RecordTimelineOS";
import LeadQuotationsOS from "@/components/static-sections/LeadQuotationsOS";
import { useSession } from "@/contexts/SessionContext";
import { useIndustryList } from "@/hooks/useIndustryList";
import { useUserList } from "@/hooks/useUserList";
import { usePipelineStages } from "@/hooks/usePipelineStages";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import {
  COMPANY_NAME_PLACEHOLDER,
  COMPANY_WEBSITE_PLACEHOLDER,
  LEAD_FORM_PLACEHOLDERS,
} from "@/lib/constants";
import {
  createContact,
  deletePipeline,
  getCompanyDetails,
  getPipelineDetails,
  updateCompany,
  updateContact,
  updatePipeline,
} from "@/lib/actions";
import {
  isStageCompatibleWithLeadSource,
  pipelineStageName,
  pipelineStageOptions,
} from "@/lib/sales";
import { userSelectOption } from "@/lib/user-select-option";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { showErrorToast } from "@/lib/toast";

const leadSourceOptions: AppSelectOption[] = [
  { value: "inbound", label: "Inbound" },
  { value: "outbound", label: "Outbound" },
];
const leadChannelOptions: AppSelectOption[] = [
  { value: "", label: "No channel" },
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "thread", label: "Thread" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
];

export default function EditLeadFormOS({
  sessionToken,
  pipeline,
  isOpen,
  onClose,
}: {
  sessionToken: string;
  pipeline: PipelineData | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const sessionUser = useSession();
  const isOwnScoped = sessionUser?.data_scope === "own";
  const catalog = usePipelineStages(!!sessionToken && isOpen);
  const [companyName, setCompanyName] = useState("");
  const [industryId, setIndustryId] = useState<number | null>(null);
  const [legalIdentifier, setLegalIdentifier] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactJobTitle, setContactJobTitle] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [leadSource, setLeadSource] = useState<LeadSource>("outbound");
  const [leadChannel, setLeadChannel] = useState<LeadChannel | "">("");
  const [stage, setStage] = useState<PipelineStage>("lead_identified");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [stageNote, setStageNote] = useState("");
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const pipelineId = pipeline?.id ?? null;
  const companyQuery = useQuery({
    queryKey: ["sales", "company", pipeline?.company_id],
    queryFn: async () =>
      requireApiData(await getCompanyDetails(pipeline!.company_id)),
    enabled: !!sessionToken && isOpen && !!pipeline,
  });
  // Only the stage timeline needs this, so it never gates the form.
  const historyQuery = useQuery({
    queryKey: ["sales", "pipeline", pipelineId],
    queryFn: async () => requireApiData(await getPipelineDetails(pipelineId!)),
    enabled: !!sessionToken && isOpen && pipelineId !== null,
  });
  const company = companyQuery.data;
  const primaryContact =
    companyQuery.data?.contacts.find((contact) => contact.primary) ??
    companyQuery.data?.contacts[0];

  const [previousOpen, setPreviousOpen] = useState(isOpen);
  const [seededPipelineId, setSeededPipelineId] = useState<number | null>(null);
  if (isOpen !== previousOpen) {
    setPreviousOpen(isOpen);
    if (!isOpen) setSeededPipelineId(null);
  }
  if (isOpen && pipeline && company && pipeline.id !== seededPipelineId) {
    setSeededPipelineId(pipeline.id);
    setCompanyName(company.name);
    setIndustryId(company.industry_id);
    setLegalIdentifier(company.legal_identifier ?? "");
    setWebsiteUrl(company.website_url ?? "");
    setImageUrl(company.image_url ?? "");
    setContactName(primaryContact?.full_name ?? "");
    setContactJobTitle(primaryContact?.job_title ?? "");
    setContactPhone(primaryContact?.phone ?? "");
    setContactEmail(primaryContact?.email ?? "");
    setLeadSource(
      company.lead_source ??
        (pipeline.stage === "triaging" ? "inbound" : "outbound")
    );
    setLeadChannel(company.lead_channel ?? "");
    setStage(pipeline.stage);
    setEstimatedValue(String(Number(pipeline.estimated_value)));
    setExpectedCloseDate(pipeline.expected_close_date ?? "");
    setOwnerId(
      isOwnScoped
        ? (sessionUser?.id ?? pipeline.sales_owner_id)
        : pipeline.sales_owner_id
    );
    setStageNote("");
  }

  const industryList = useIndustryList(!!sessionToken && isOpen);
  const userList = useUserList(isOpen && !isOwnScoped);
  const industryOptions: AppSelectOption[] = industryList.map((industry) => ({
    value: industry.id,
    label: industry.name,
  }));
  const ownerOptions: AppSelectOption[] = userList.map(userSelectOption);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!pipeline || !company)
        throw new Error("Lead details are not loaded.");
      const companyPayload = {
        id: company.id,
        company: {
          name: companyName.trim(),
          industry_id: industryId,
          lead_source: leadSource,
          lead_channel: leadChannel || null,
          legal_identifier: legalIdentifier.trim() || null,
          website_url: websiteUrl.trim() || null,
          image_url: imageUrl.trim() || null,
        },
      };
      const pipelinePayload = {
        id: pipeline.id,
        company_id: pipeline.company_id,
        sales_owner_id: ownerId,
        stage,
        estimated_value: estimatedValue ? Number(estimatedValue) : 0,
        expected_close_date: expectedCloseDate || null,
        stage_note: stage !== pipeline.stage ? stageNote.trim() || null : null,
      };
      const sourceChanged = company.lead_source !== leadSource;
      const companyCanUpdateFirst = isStageCompatibleWithLeadSource(
        pipeline.stage,
        leadSource
      );
      const pipelineCanUpdateFirst = company.lead_source
        ? isStageCompatibleWithLeadSource(stage, company.lead_source)
        : false;

      if (sourceChanged && !companyCanUpdateFirst && !pipelineCanUpdateFirst) {
        throw new Error(
          "Move the lead to a neutral stage and save it before switching between inbound/triaging and outbound/attempting."
        );
      }

      let pipelineUpdated = false;
      if (sourceChanged && !companyCanUpdateFirst) {
        requireApiData(await updatePipeline(pipelinePayload));
        pipelineUpdated = true;
      }

      requireApiData(await updateCompany(companyPayload));
      const contact = {
        full_name: contactName.trim(),
        email: contactEmail.trim() || null,
        phone: contactPhone.trim() || null,
        job_title: contactJobTitle.trim() || null,
        primary: true,
      };
      if (primaryContact) {
        requireApiData(
          await updateContact({
            id: primaryContact.id,
            company_id: company.id,
            contact,
          })
        );
      } else {
        requireApiData(
          await createContact({ company_id: company.id, contact })
        );
      }
      return pipelineUpdated
        ? undefined
        : requireApiData(await updatePipeline(pipelinePayload));
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sales", "pipelines"] }),
        queryClient.invalidateQueries({
          queryKey: ["sales", "pipeline", pipelineId],
        }),
        queryClient.invalidateQueries({ queryKey: ["sales", "companies"] }),
        queryClient.invalidateQueries({
          queryKey: ["sales", "company", company?.id],
        }),
      ]);
      handleClose();
    },
    onError: (cause) =>
      showErrorToast(
        cause instanceof Error ? cause.message : "Failed to update lead."
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: async () =>
      requireApiSuccess(await deletePipeline(pipeline!.id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "pipelines"] });
      setIsConfirmingDelete(false);
      handleClose();
    },
    onError: (cause) => {
      setIsConfirmingDelete(false);
      showErrorToast(
        cause instanceof Error ? cause.message : "Failed to delete lead."
      );
    },
  });

  function handleClose() {
    if (isLogoUploading) return;
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isLogoUploading)
      return showErrorToast("Please wait for the logo upload to finish.");
    if (!companyName.trim()) return showErrorToast("Company name is required.");
    if (!contactName.trim())
      return showErrorToast("Primary contact name is required.");
    if (!ownerId) return showErrorToast("Sales owner is required.");
    if (stage === "triaging" && leadSource !== "inbound")
      return showErrorToast("Triaging requires an inbound lead source.");
    if (stage === "attempting" && leadSource !== "outbound")
      return showErrorToast("Attempting requires an outbound lead source.");
    saveMutation.mutate();
  }

  const timeline = (historyQuery.data?.stage_history ?? []).map((entry) => ({
    id: `stage-${entry.id}`,
    field_changed: "stage",
    is_creation: entry.from_stage === null,
    old_value: entry.from_stage
      ? pipelineStageName(entry.from_stage, catalog.stages)
      : null,
    new_value: pipelineStageName(entry.to_stage, catalog.stages),
    reason: entry.note,
    actor_name: entry.changed_by_name,
    actor_avatar: entry.changed_by_avatar,
    created_at: entry.created_at,
  }));
  const isReady = !!pipeline && !!company && !companyQuery.isLoading;

  return [
    <SheetOS
      key="sheet"
      title="Edit Lead"
      description="Update company, primary contact, and pipeline data."
      isOpen={isOpen}
      onClose={handleClose}
    >
      {!isReady ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
            <div className="flex flex-col gap-3 rounded-xl border border-line-soft bg-gray-50 p-4 dark:bg-zinc-800/50">
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                Company
              </p>
              <CompanyLogoUploadOS
                inputId="edit-lead-company-logo"
                value={imageUrl}
                onChange={setImageUrl}
                onBusyChange={setIsLogoUploading}
                disabled={saveMutation.isPending || deleteMutation.isPending}
              />
              <AppInput
                inputId="edit-lead-company-name"
                label="Company Name"
                required
                placeholder={COMPANY_NAME_PLACEHOLDER}
                value={companyName}
                onChange={(event) => setCompanyName(event.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <AppSelect
                  selectId="edit-lead-source"
                  label="Lead Source"
                  required
                  placeholder="Pick a source"
                  value={leadSource}
                  onChange={(value) => setLeadSource(value as LeadSource)}
                  options={leadSourceOptions}
                />
                <AppSelect
                  selectId="edit-lead-channel"
                  label="Lead Channel"
                  placeholder="Pick a channel"
                  value={leadChannel}
                  onChange={(value) =>
                    setLeadChannel((value as LeadChannel) || "")
                  }
                  options={leadChannelOptions}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AppSelect
                  selectId="edit-lead-industry"
                  label="Industry"
                  placeholder="Pick an industry"
                  value={industryId}
                  onChange={(value) => setIndustryId(value as number | null)}
                  options={industryOptions}
                />
                <AppInput
                  inputId="edit-lead-legal-identifier"
                  label="Legal Identifier"
                  placeholder={LEAD_FORM_PLACEHOLDERS.legalIdentifier}
                  value={legalIdentifier}
                  onChange={(event) => setLegalIdentifier(event.target.value)}
                />
              </div>
              <AppInput
                inputId="edit-lead-website-url"
                label="Website URL"
                type="url"
                placeholder={COMPANY_WEBSITE_PLACEHOLDER}
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
              />
              <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Primary contact
              </p>
              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  inputId="edit-lead-contact-name"
                  label="Full Name"
                  placeholder={LEAD_FORM_PLACEHOLDERS.fullName}
                  required
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                />
                <AppInput
                  inputId="edit-lead-contact-job-title"
                  label="Job Title"
                  placeholder={LEAD_FORM_PLACEHOLDERS.jobTitle}
                  value={contactJobTitle}
                  onChange={(event) => setContactJobTitle(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AppInput
                  inputId="edit-lead-contact-phone"
                  label="Phone"
                  placeholder={LEAD_FORM_PLACEHOLDERS.phone}
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                />
                <AppInput
                  inputId="edit-lead-contact-email"
                  label="Email"
                  placeholder={LEAD_FORM_PLACEHOLDERS.email}
                  type="email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppSelect
                selectId="edit-lead-stage"
                label="Stage"
                required
                placeholder="Pick a stage"
                value={stage}
                onChange={(value) => setStage(value as PipelineStage)}
                options={pipelineStageOptions(catalog.stages)}
              />
              <AppNumberInput
                inputId="edit-lead-estimated-value"
                label="Estimated Value (Rp)"
                mode="numeric"
                value={estimatedValue}
                onValueChange={setEstimatedValue}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AppInput
                inputId="edit-lead-expected-close-date"
                label="Expected Close Date"
                type="date"
                value={expectedCloseDate}
                onChange={(event) => setExpectedCloseDate(event.target.value)}
              />
            </div>
            {stage !== pipeline.stage && (
              <AppTextArea
                textAreaId="edit-lead-stage-note"
                label="Stage Note"
                rows={2}
                value={stageNote}
                onChange={(event) => setStageNote(event.target.value)}
                placeholder="Optional context for this stage change"
              />
            )}
            {!isOwnScoped && (
              <AppSelect
                selectId="edit-lead-owner"
                label="Sales Owner"
                required
                placeholder="Assign an owner"
                value={ownerId}
                onChange={(value) => setOwnerId((value as string) ?? "")}
                options={ownerOptions}
              />
            )}
            <LeadQuotationsOS
              pipelineId={pipeline.id}
              sessionToken={sessionToken}
              disabled={
                isLogoUploading ||
                saveMutation.isPending ||
                deleteMutation.isPending
              }
            />
            <section className="shrink-0 overflow-hidden rounded-xl border border-line">
              <div className="flex min-h-14 items-center border-b border-line-soft px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                  Pipeline History
                </h3>
              </div>
              <div className="p-4">
                {historyQuery.isLoading ? (
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                ) : (
                  <RecordTimelineOS entries={timeline} />
                )}
              </div>
            </section>
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-line-soft bg-white px-6 py-4 dark:bg-zinc-900">
            <AppButton
              type="button"
              variant="destructive"
              size="icon"
              title="Delete lead"
              disabled={deleteMutation.isPending || isLogoUploading}
              onClick={() => setIsConfirmingDelete(true)}
            >
              {deleteMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
            </AppButton>
            <AppButton
              type="button"
              variant="outline"
              className="flex-1 justify-center"
              disabled={isLogoUploading}
              onClick={handleClose}
            >
              Cancel
            </AppButton>
            <AppButton
              type="submit"
              variant="primary"
              className="flex-1 justify-center"
              disabled={saveMutation.isPending || isLogoUploading}
            >
              {saveMutation.isPending && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Save Changes
            </AppButton>
          </div>
        </form>
      )}
    </SheetOS>,
    <AlertConfirmationOS
      key="confirm-delete"
      isOpen={isConfirmingDelete}
      onClose={() => setIsConfirmingDelete(false)}
      onConfirm={() => pipeline && deleteMutation.mutate()}
      title="Delete this lead?"
      message={
        pipeline
          ? `Delete the pipeline for “${pipeline.company_name}”? This can't be undone.`
          : ""
      }
      confirmLabel="Delete"
      destructive
      isPending={deleteMutation.isPending}
    />,
  ];
}
