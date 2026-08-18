"use client";

import AppSearchableSelect, {
  AppSearchableOption,
} from "@/components/fields/AppSearchableSelect";
import AppButton from "@/components/buttons/AppButton";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { usePricingBuilder } from "@/hooks/usePricingBuilder";
import { getRupiahCurrency } from "@/lib/currency";
import { setSessionToken, trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

function Block({
  step,
  title,
  side,
  children,
}: {
  step: number;
  title: string;
  side?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-gray-300 bg-card-bg p-4 dark:border-zinc-700">
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gray-900 text-xs font-bold text-white dark:bg-zinc-700">
          {step}
        </span>
        <h3 className="font-bold text-gray-900 dark:text-zinc-100">{title}</h3>
        {side && (
          <span className="ml-auto font-mono text-sm font-semibold text-gray-900 dark:text-zinc-100">
            {side}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

export default function PricingCalculatorPageOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const router = useRouter();
  const utils = trpc.useUtils();

  const { data: sessionData } = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const canViewCostDetails =
    !!sessionData && sessionData.user.role_name !== "Business Development";

  // Optionally pre-linked to a lead via ?pipeline_id=, like /tasks?pipeline_id=.
  const searchParams = useSearchParams();
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(
    () => {
      const linked = searchParams.get("pipeline_id");
      return linked ? Number(linked) : null;
    }
  );
  const [selectedPipelineOption, setSelectedPipelineOption] =
    useState<AppSearchableOption | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function loadPipelineOptions(inputValue: string, page: number) {
    const result = await utils.list.b2b.pipelines.fetch({
      keyword: inputValue || undefined,
      page,
      page_size: 20,
    });
    return {
      options: result.list.map((p) => ({
        value: p.id,
        label: `${p.company_name} - ${p.name}`,
      })),
      hasMore: page < result.metapaging.total_page!,
    };
  }

  function handlePipelineChange(option: AppSearchableOption | null) {
    setSelectedPipelineOption(option);
    setSelectedPipelineId(option ? (option.value as number) : null);
  }

  const builder = usePricingBuilder({
    isEditable: true,
    canViewCostDetails,
    seed: null,
  });

  const createQuotation = trpc.create.b2b.quotation.useMutation();
  const submitQuotationMutation = trpc.update.b2b.submitQuotation.useMutation();

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false);

  async function handleSaveDraft() {
    setSaveError(null);
    if (!selectedPipelineId) {
      setSaveError("Pilih lead untuk menyimpan ini sebagai Quotation.");
      return;
    }
    setIsSavingDraft(true);
    try {
      const created = await createQuotation.mutateAsync({
        pipeline_id: selectedPipelineId,
        ...builder.buildQuotationPayload(),
      });
      router.push(`/quotations/${created.id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan draft.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleSubmit() {
    setSaveError(null);
    if (!selectedPipelineId) {
      setSaveError("Pilih lead untuk menyimpan ini sebagai Quotation.");
      return;
    }
    setIsSubmittingQuotation(true);
    try {
      const created = await createQuotation.mutateAsync({
        pipeline_id: selectedPipelineId,
        ...builder.buildQuotationPayload(),
      });
      await submitQuotationMutation.mutateAsync({ id: created.id });
      router.push(`/quotations/${created.id}`);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Gagal membuat quotation."
      );
    } finally {
      setIsSubmittingQuotation(false);
    }
  }

  const editorBlocks = (
    <>
      <Block step={1} title="Pilih Paket">
        {builder.packageContent}
      </Block>
      <Block step={2} title="Susunan hari">
        {builder.daysContent}
      </Block>
      <Block
        step={3}
        title="Materi"
        side={`${getRupiahCurrency(builder.materiPricePerSesi)}/sesi`}
      >
        {builder.materiContent}
      </Block>
      <Block
        step={4}
        title="Add ons"
        side={getRupiahCurrency(builder.addonsTotalPrice)}
      >
        {builder.addonsContent}
      </Block>
      <Block step={5} title="Komersial">
        {builder.commercialContent}
      </Block>
    </>
  );

  return (
    <div className="flex min-w-0 flex-col gap-5 overflow-x-hidden px-4 py-6 sm:px-8">
      <PageHeaderOS
        title="Pricing Calculator"
        description="Susun penawaran program AI per hari. Harga, biaya, dan net margin dihitung langsung."
      />

      {selectedPipelineId === null && (
        <div className="rounded-xl border border-gray-300 bg-card-bg p-4 dark:border-zinc-700">
          <AppSearchableSelect
            selectId="quotation-pipeline-picker"
            label="Pilih Lead"
            placeholder="Ketik untuk cari lead supaya tersimpan sebagai Quotation"
            value={selectedPipelineOption}
            onChange={handlePipelineChange}
            loadOptions={loadPipelineOptions}
          />
          <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">
            Kosongkan kalau cuma mau hitung-hitungan cepat — ringkasan tetap
            bisa disalin, tapi hasilnya tidak tersimpan, tidak masuk approval
            Manager, dan PDF-nya baru bisa diunduh setelah tersimpan sebagai
            Quotation (dari halaman Quotations).
          </p>
        </div>
      )}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">{editorBlocks}</div>

        <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-6">
          {builder.totalValueBox}
          {builder.priceBreakdownCard}
          {builder.costBreakdownCard}
          {builder.flagsBlock}
          {builder.copyButtonBlock}

          {saveError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {saveError}
            </p>
          )}

          <div className="flex gap-2">
            <AppButton
              type="button"
              variant="outline"
              className="flex-1 justify-center"
              disabled={isSavingDraft || isSubmittingQuotation}
              onClick={handleSaveDraft}
            >
              {isSavingDraft && <Loader2 size={14} className="animate-spin" />}
              Simpan Draft
            </AppButton>
            <AppButton
              type="button"
              variant="primary"
              className="flex-1 justify-center"
              disabled={isSavingDraft || isSubmittingQuotation}
              onClick={handleSubmit}
            >
              {isSubmittingQuotation && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Buat Quotation
            </AppButton>
          </div>
        </div>
      </div>
    </div>
  );
}
