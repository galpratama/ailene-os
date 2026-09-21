"use client";

import type { LeadChannel, LeadSource, PipelinePhase, PipelineStage } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSearchableSelect, { type AppSearchableOption } from "@/components/fields/AppSearchableSelect";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import SheetOS from "@/components/modals/SheetOS";
import { useSession } from "@/contexts/SessionContext";
import { useIndustryList } from "@/hooks/useIndustryList";
import { useUserList } from "@/hooks/useUserList";
import { requireApiData } from "@/lib/api-result";
import { createPipeline, listCompanies } from "@/lib/actions";
import { isStageCompatibleWithLeadSource, pipelineStageOptions } from "@/lib/sales";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
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

type CompanySearchOption = AppSearchableOption & {
  leadSource: LeadSource | null;
};

function segmentClass(active: boolean) {
  return `h-7 px-3 rounded-md text-xs font-semibold transition-colors ${
    active
      ? "bg-lime-bright text-forest-deep"
      : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
  }`;
}

export default function CreateLeadFormOS({
  sessionToken,
  phase,
  isOpen,
  onClose,
}: {
  sessionToken: string;
  phase: PipelinePhase;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const sessionUser = useSession();
  const isOwnScoped = sessionUser?.data_scope === "OWN";
  const [useExistingCompany, setUseExistingCompany] = useState(false);
  const [companyOption, setCompanyOption] = useState<CompanySearchOption | null>(null);
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
  const [stage, setStage] = useState<PipelineStage>(
    phase === "sdr" ? "lead_identified" : "discovery_done"
  );
  const [estimatedValue, setEstimatedValue] = useState("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const industryList = useIndustryList(!!sessionToken && isOpen);
  const userList = useUserList(isOpen && !isOwnScoped);

  const [previousOpen, setPreviousOpen] = useState(isOpen);
  const [seededOpen, setSeededOpen] = useState(false);
  if (isOpen !== previousOpen) {
    setPreviousOpen(isOpen);
    if (!isOpen) setSeededOpen(false);
  }
  if (isOpen && !seededOpen) {
    setSeededOpen(true);
    setStage(phase === "sdr" ? "lead_identified" : "discovery_done");
    if (isOwnScoped && sessionUser) setOwnerId(sessionUser.id);
  }

  const industryOptions: AppSelectOption[] = industryList.map((industry) => ({
    value: industry.id,
    label: industry.name,
  }));
  const ownerOptions: AppSelectOption[] = userList.map((user) => ({
    value: user.id,
    label: user.full_name,
  }));

  const mutation = useMutation({
    mutationFn: async () => {
      const common = {
        sales_owner_id: ownerId || undefined,
        stage,
        estimated_value: estimatedValue ? Number(estimatedValue) : 0,
        expected_close_date: expectedCloseDate || null,
      };
      return requireApiData(
        await createPipeline(
          useExistingCompany
            ? { ...common, company_id: companyOption!.value as number }
            : {
                ...common,
                new_company: {
                  name: companyName.trim(),
                  industry_id: industryId,
                  lead_source: leadSource,
                  lead_channel: leadChannel || null,
                  legal_identifier: legalIdentifier.trim() || null,
                  website_url: websiteUrl.trim() || null,
                  image_url: imageUrl.trim() || null,
                },
                new_contact: {
                  full_name: contactName.trim(),
                  email: contactEmail.trim() || null,
                  phone: contactPhone.trim() || null,
                  job_title: contactJobTitle.trim() || null,
                  primary: true,
                },
              }
        )
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sales", "pipelines"] }),
        queryClient.invalidateQueries({ queryKey: ["sales", "companies"] }),
      ]);
      handleClose();
    },
    onError: (cause) => setError(cause instanceof Error ? cause.message : "Failed to create lead."),
  });

  async function loadCompanyOptions(inputValue: string, page: number) {
    const result = requireApiData(
      await listCompanies({ keyword: inputValue || undefined, page, page_size: 20 })
    );
    return {
      options: result.list.map((company) => ({
        value: company.id,
        label: company.name,
        leadSource: company.lead_source,
      })),
      hasMore: result.metapaging.current_page < result.metapaging.total_page,
    };
  }

  function resetForm() {
    setUseExistingCompany(false);
    setCompanyOption(null);
    setCompanyName("");
    setIndustryId(null);
    setLegalIdentifier("");
    setWebsiteUrl("");
    setImageUrl("");
    setContactName("");
    setContactJobTitle("");
    setContactPhone("");
    setContactEmail("");
    setLeadSource("outbound");
    setLeadChannel("");
    setEstimatedValue("");
    setExpectedCloseDate("");
    setOwnerId("");
    setError(null);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (useExistingCompany && !companyOption) return setError("Pick an existing company.");
    if (!useExistingCompany && !companyName.trim()) return setError("Company name is required.");
    if (!useExistingCompany && !contactName.trim()) return setError("Primary contact name is required.");
    if (!ownerId && !isOwnScoped) return setError("Sales owner is required.");
    const companyLeadSource = useExistingCompany ? companyOption?.leadSource : leadSource;
    if (!companyLeadSource) return setError("Set this company's lead source before creating a pipeline.");
    if (!isStageCompatibleWithLeadSource(stage, companyLeadSource)) {
      return setError(
        stage === "triaging"
          ? "Triaging requires an inbound lead source."
          : "Attempting requires an outbound lead source."
      );
    }
    mutation.mutate();
  }

  return (
    <SheetOS title={`Add ${phase.toUpperCase()} Lead`} description="Create a company-linked sales pipeline in the Java API." isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">{error}</p>}

          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
            <div className="flex items-center justify-between gap-2">
              <div><p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Company</p><p className="text-xs text-gray-500">Create a company and primary contact, or use an existing company.</p></div>
              <div className="flex rounded-lg border border-gray-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-900">
                <button type="button" onClick={() => setUseExistingCompany(false)} className={segmentClass(!useExistingCompany)}>New</button>
                <button type="button" onClick={() => setUseExistingCompany(true)} className={segmentClass(useExistingCompany)}>Existing</button>
              </div>
            </div>
            {useExistingCompany ? (
              <AppSearchableSelect selectId="lead-company" label="Company" required placeholder="Type to search companies..." value={companyOption} onChange={(option) => setCompanyOption(option as CompanySearchOption | null)} loadOptions={loadCompanyOptions} />
            ) : (
              <>
                <AppInput inputId="lead-company-name" label="Company Name" required value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
                <div className="grid grid-cols-2 gap-3">
                  <AppSelect selectId="lead-source" label="Lead Source" required placeholder="Pick a source" value={leadSource} onChange={(value) => setLeadSource(value as LeadSource)} options={leadSourceOptions} />
                  <AppSelect selectId="lead-channel" label="Lead Channel" placeholder="Pick a channel" value={leadChannel} onChange={(value) => setLeadChannel((value as LeadChannel) || "")} options={leadChannelOptions} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <AppSelect selectId="lead-industry" label="Industry" placeholder="Pick an industry" value={industryId} onChange={(value) => setIndustryId(value as number | null)} options={industryOptions} />
                  <AppInput inputId="lead-legal-identifier" label="Legal Identifier" value={legalIdentifier} onChange={(event) => setLegalIdentifier(event.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <AppInput inputId="lead-website-url" label="Website URL" type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://" />
                  <AppInput inputId="lead-company-image-url" label="Logo URL" type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://" />
                </div>
                <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Primary contact</p>
                <div className="grid grid-cols-2 gap-3">
                  <AppInput inputId="lead-contact-name" label="Full Name" required value={contactName} onChange={(event) => setContactName(event.target.value)} />
                  <AppInput inputId="lead-contact-job-title" label="Job Title" value={contactJobTitle} onChange={(event) => setContactJobTitle(event.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <AppInput inputId="lead-contact-phone" label="Phone" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} />
                  <AppInput inputId="lead-contact-email" label="Email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} />
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AppSelect selectId="lead-stage" label="Stage" required placeholder="Pick a stage" value={stage} onChange={(value) => setStage(value as PipelineStage)} options={pipelineStageOptions(phase)} />
            <AppNumberInput inputId="lead-estimated-value" label="Estimated Value (Rp)" mode="numeric" value={estimatedValue} onValueChange={setEstimatedValue} placeholder="0" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AppInput inputId="lead-expected-close-date" label="Expected Close Date" type="date" value={expectedCloseDate} onChange={(event) => setExpectedCloseDate(event.target.value)} />
          </div>
          {!isOwnScoped && <AppSelect selectId="lead-owner" label="Sales Owner" required placeholder="Assign an owner" value={ownerId} onChange={(value) => setOwnerId((value as string) ?? "")} options={ownerOptions} />}
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <AppButton type="button" variant="outline" className="flex-1 justify-center" onClick={handleClose}>Cancel</AppButton>
          <AppButton type="submit" variant="primary" className="flex-1 justify-center" disabled={mutation.isPending}>{mutation.isPending && <Loader2 size={14} className="animate-spin" />}Create Lead</AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
