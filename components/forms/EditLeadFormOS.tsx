"use client";

import type { LeadChannel, LeadSource, PipelineData, PipelineStage } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import RecordTimelineOS from "@/components/elements/RecordTimelineOS";
import { useSession } from "@/contexts/SessionContext";
import { useIndustryList } from "@/hooks/useIndustryList";
import { useUserList } from "@/hooks/useUserList";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import {
  createContact,
  deletePipeline,
  getCompanyDetails,
  getPipelineDetails,
  updateCompany,
  updateContact,
  updatePipeline,
} from "@/lib/actions";
import { isStageCompatibleWithLeadSource, PIPELINE_STAGE_LABELS, pipelineStageOptions } from "@/lib/sales";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { type FormEvent, useState } from "react";

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
  const isOwnScoped = sessionUser?.data_scope === "OWN";
  const [companyName, setCompanyName] = useState("");
  const [industryId, setIndustryId] = useState<number | null>(null);
  const [legalIdentifier, setLegalIdentifier] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
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
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const pipelineId = pipeline?.id ?? null;
  const companyQuery = useQuery({
    queryKey: ["sales", "company", pipeline?.company_id],
    queryFn: async () => requireApiData(await getCompanyDetails(pipeline!.company_id)),
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
    setLeadSource(company.lead_source ?? (pipeline.stage === "triaging" ? "inbound" : "outbound"));
    setLeadChannel(company.lead_channel ?? "");
    setStage(pipeline.stage);
    setEstimatedValue(String(Number(pipeline.estimated_value)));
    setExpectedCloseDate(pipeline.expected_close_date ?? "");
    setOwnerId(isOwnScoped ? (sessionUser?.id ?? pipeline.sales_owner_id) : pipeline.sales_owner_id);
    setStageNote("");
  }

  const industryList = useIndustryList(!!sessionToken && isOpen);
  const userList = useUserList(isOpen && !isOwnScoped);
  const industryOptions: AppSelectOption[] = industryList.map((industry) => ({
    value: industry.id,
    label: industry.name,
  }));
  const ownerOptions: AppSelectOption[] = userList.map((user) => ({
    value: user.id,
    label: user.full_name,
  }));

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!pipeline || !company) throw new Error("Lead details are not loaded.");
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
      const companyCanUpdateFirst = isStageCompatibleWithLeadSource(pipeline.stage, leadSource);
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
        requireApiData(await updateContact({ id: primaryContact.id, company_id: company.id, contact }));
      } else {
        requireApiData(await createContact({ company_id: company.id, contact }));
      }
      return pipelineUpdated ? undefined : requireApiData(await updatePipeline(pipelinePayload));
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sales", "pipelines"] }),
        queryClient.invalidateQueries({ queryKey: ["sales", "pipeline", pipelineId] }),
        queryClient.invalidateQueries({ queryKey: ["sales", "companies"] }),
        queryClient.invalidateQueries({ queryKey: ["sales", "company", company?.id] }),
      ]);
      handleClose();
    },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Failed to update lead."),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => requireApiSuccess(await deletePipeline(pipeline!.id)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "pipelines"] });
      setIsConfirmingDelete(false);
      handleClose();
    },
    onError: (cause) => {
      setIsConfirmingDelete(false);
      setError(cause instanceof Error ? cause.message : "Failed to delete lead.");
    },
  });

  function handleClose() {
    setError(null);
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!companyName.trim()) return setError("Company name is required.");
    if (!contactName.trim()) return setError("Primary contact name is required.");
    if (!ownerId) return setError("Sales owner is required.");
    if (stage === "triaging" && leadSource !== "inbound") return setError("Triaging requires an inbound lead source.");
    if (stage === "attempting" && leadSource !== "outbound") return setError("Attempting requires an outbound lead source.");
    saveMutation.mutate();
  }

  const timeline = (historyQuery.data?.stage_history ?? []).map((entry) => ({
    id: `stage-${entry.id}`,
    field_changed: "stage",
    old_value: entry.from_stage ? PIPELINE_STAGE_LABELS[entry.from_stage] : null,
    new_value: PIPELINE_STAGE_LABELS[entry.to_stage],
    reason: entry.note,
    actor_name: entry.changed_by,
    created_at: entry.created_at,
  }));
  const isReady = !!pipeline && !!company && !companyQuery.isLoading;

  return [
    <SheetOS key="sheet" title="Edit Lead" description="Update company, primary contact, and pipeline data." isOpen={isOpen} onClose={handleClose}>
      {!isReady ? (
        <div className="flex flex-1 items-center justify-center py-20"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
      ) : (
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">{error}</p>}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Company</p>
              <AppInput inputId="edit-lead-company-name" label="Company Name" required value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <AppSelect selectId="edit-lead-source" label="Lead Source" required placeholder="Pick a source" value={leadSource} onChange={(value) => setLeadSource(value as LeadSource)} options={leadSourceOptions} />
                <AppSelect selectId="edit-lead-channel" label="Lead Channel" placeholder="Pick a channel" value={leadChannel} onChange={(value) => setLeadChannel((value as LeadChannel) || "")} options={leadChannelOptions} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AppSelect selectId="edit-lead-industry" label="Industry" placeholder="Pick an industry" value={industryId} onChange={(value) => setIndustryId(value as number | null)} options={industryOptions} />
                <AppInput inputId="edit-lead-legal-identifier" label="Legal Identifier" value={legalIdentifier} onChange={(event) => setLegalIdentifier(event.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AppInput inputId="edit-lead-website-url" label="Website URL" type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} />
                <AppInput inputId="edit-lead-image-url" label="Logo URL" type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} />
              </div>
              <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Primary contact</p>
              <div className="grid grid-cols-2 gap-3">
                <AppInput inputId="edit-lead-contact-name" label="Full Name" required value={contactName} onChange={(event) => setContactName(event.target.value)} />
                <AppInput inputId="edit-lead-contact-job-title" label="Job Title" value={contactJobTitle} onChange={(event) => setContactJobTitle(event.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <AppInput inputId="edit-lead-contact-phone" label="Phone" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
                <AppInput inputId="edit-lead-contact-email" label="Email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <AppSelect selectId="edit-lead-stage" label="Stage" required placeholder="Pick a stage" value={stage} onChange={(value) => setStage(value as PipelineStage)} options={pipelineStageOptions()} />
              <AppNumberInput inputId="edit-lead-estimated-value" label="Estimated Value (Rp)" mode="numeric" value={estimatedValue} onValueChange={setEstimatedValue} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <AppInput inputId="edit-lead-expected-close-date" label="Expected Close Date" type="date" value={expectedCloseDate} onChange={(event) => setExpectedCloseDate(event.target.value)} />
            </div>
            {stage !== pipeline.stage && <AppTextArea textAreaId="edit-lead-stage-note" label="Stage Note" rows={2} value={stageNote} onChange={(event) => setStageNote(event.target.value)} placeholder="Optional context for this stage change" />}
            {!isOwnScoped && <AppSelect selectId="edit-lead-owner" label="Sales Owner" required placeholder="Assign an owner" value={ownerId} onChange={(value) => setOwnerId((value as string) ?? "")} options={ownerOptions} />}
            <div><p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Stage History</p><div className="mt-2">{historyQuery.isLoading ? <Loader2 size={14} className="animate-spin text-gray-400" /> : <RecordTimelineOS entries={timeline} />}</div></div>
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
            <AppButton type="button" variant="outline" size="icon" title="Delete lead" className="text-red-600 border-red-200 hover:bg-red-50" disabled={deleteMutation.isPending} onClick={() => setIsConfirmingDelete(true)}>{deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}</AppButton>
            <AppButton type="button" variant="outline" className="flex-1 justify-center" onClick={handleClose}>Cancel</AppButton>
            <AppButton type="submit" variant="primary" className="flex-1 justify-center" disabled={saveMutation.isPending}>{saveMutation.isPending && <Loader2 size={14} className="animate-spin" />}Save Changes</AppButton>
          </div>
        </form>
      )}
    </SheetOS>,
    <AlertConfirmationOS key="confirm-delete" isOpen={isConfirmingDelete} onClose={() => setIsConfirmingDelete(false)} onConfirm={() => pipeline && deleteMutation.mutate()} title="Delete this lead?" message={pipeline ? `Delete the pipeline for “${pipeline.company_name}”? This can't be undone.` : ""} confirmLabel="Delete" destructive isPending={deleteMutation.isPending} />,
  ];
}
