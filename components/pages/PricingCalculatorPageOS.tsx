"use client";

import AppSearchableSelect, {
  AppSearchableOption,
} from "@/components/fields/AppSearchableSelect";
import AppButton from "@/components/buttons/AppButton";
import QuotationFlowStepperOS from "@/components/elements/QuotationFlowStepperOS";
import QuotationStatusLabel from "@/components/labels/QuotationStatusLabel";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { usePricingBuilder } from "@/hooks/usePricingBuilder";
import { useQuotationList } from "@/hooks/useQuotationList";
import { useSession } from "@/contexts/SessionContext";
import { createQuotation, getPipelineDetails, listPipelines, submitQuotation } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { getRupiahCurrency } from "@/lib/currency";
import { formatQuotationNumber } from "@/lib/quotation-number";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Check, CopyPlus, Info, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import type { PipelinePhase } from "@/apis/sales";

const PICKER_PHASES: PipelinePhase[] = ["sdr", "bdr"];
const PICKER_PAGE_SIZE = 10;

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
    <section className="rounded-xl border border-line bg-card-bg p-4">
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gray-900 text-xs font-bold text-white dark:bg-zinc-700">
          {step}
        </span>
        <h3 className="font-bold text-gray-900 dark:text-zinc-100">{title}</h3>
        {side && (
          <span className="ml-auto text-sm font-semibold tabular-nums text-gray-900 dark:text-zinc-100">
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
  initialPipelineId = null,
}: {
  sessionToken: string;
  initialPipelineId?: number | null;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const sessionUser = useSession();
  const canViewCostDetails =
    !!sessionUser && sessionUser.role === "administrator";

  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(initialPipelineId);
  const [selectedPipelineOption, setSelectedPipelineOption] =
    useState<AppSearchableOption | null>(null);
  const selectedPipeline = useQuery({
    queryKey: ["sales", "pipeline", selectedPipelineId],
    queryFn: async () => requireApiData(await getPipelineDetails(selectedPipelineId!)),
    enabled: !!sessionToken && selectedPipelineId !== null,
  });
  const linkedPipelineOption = selectedPipeline.data
    ? { value: selectedPipeline.data.id, label: selectedPipeline.data.company_name }
    : null;

  // The API filters one phase per call, so each page asks both phases for the typed keyword.
  async function loadPipelineOptions(inputValue: string, page: number) {
    const keyword = inputValue.trim() || undefined;
    const results = await Promise.all(
      PICKER_PHASES.map(async (phase) =>
        requireApiData(await listPipelines({ phase, keyword, page, page_size: PICKER_PAGE_SIZE }))
      )
    );
    return {
      options: results.flatMap((result) =>
        result.list.map((pipeline) => ({ value: pipeline.id, label: pipeline.company_name }))
      ),
      hasMore: results.some((result) => result.metapaging.current_page < result.metapaging.total_page),
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

  // A pipeline gets a new version only once its current quotation is approved.
  const pipelineQuotations = useQuotationList(
    { pipeline_id: selectedPipelineId ?? undefined },
    !!sessionToken && selectedPipelineId !== null
  );
  const currentQuotation =
    selectedPipelineId === null ? null : pipelineQuotations.data?.find((row) => row.is_current) ?? null;
  const blockingQuotation = currentQuotation && currentQuotation.status !== "approved" ? currentQuotation : null;
  const isCheckingPipeline = selectedPipelineId !== null && (!selectedPipeline.isSuccess || pipelineQuotations.isLoading);

  // Both buttons draft first; "Buat Quotation" then submits the new draft straight away.
  async function draftQuotation(pipelineId: number) {
    const created = requireApiData(
      await createQuotation({
        pipeline_id: pipelineId,
        ...builder.buildQuotationPayload(),
      })
    );
    await queryClient.invalidateQueries({ queryKey: ["quotations"] });
    return created;
  }

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false);

  async function handleSaveDraft() {
    if (!selectedPipelineId) {
      showErrorToast("Pilih lead untuk menyimpan ini sebagai Quotation.");
      return;
    }
    if (!selectedPipeline.isSuccess) {
      showErrorToast("Lead belum berhasil dimuat. Silakan coba lagi.");
      return;
    }
    setIsSavingDraft(true);
    try {
      const created = await draftQuotation(selectedPipelineId);
      showSuccessToast(`Draft ${formatQuotationNumber(created)} tersimpan.`);
      router.push(`/quotations/${created.id}`);
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : "Gagal menyimpan draft.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleSubmit() {
    if (!selectedPipelineId) {
      showErrorToast("Pilih lead untuk menyimpan ini sebagai Quotation.");
      return;
    }
    if (!selectedPipeline.isSuccess) {
      showErrorToast("Lead belum berhasil dimuat. Silakan coba lagi.");
      return;
    }
    setIsSubmittingQuotation(true);
    try {
      const created = await draftQuotation(selectedPipelineId);
      const submitted = requireApiData(await submitQuotation(created.id));
      await queryClient.invalidateQueries({ queryKey: ["quotations"] });
      showSuccessToast(
        submitted.status === "approved"
          ? `${formatQuotationNumber(created)} disetujui otomatis dan siap dikirim ke klien.`
          : `${formatQuotationNumber(created)} diajukan ke manager untuk direview.`
      );
      router.push(`/quotations/${created.id}`);
    } catch (err) {
      showErrorToast(
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

      <div className="rounded-xl border border-line bg-card-bg p-4">
        <AppSearchableSelect
          selectId="quotation-pipeline-picker"
          label="Pilih Lead"
          placeholder={selectedPipelineId !== null && selectedPipeline.isLoading ? "Memuat lead..." : "Ketik untuk cari lead supaya tersimpan sebagai Quotation"}
          value={selectedPipelineOption ?? linkedPipelineOption}
          onChange={handlePipelineChange}
          loadOptions={loadPipelineOptions}
          debounceMs={300}
          disabled={isSavingDraft || isSubmittingQuotation}
        />
        {selectedPipeline.isError && (
          <p className="mt-2 text-xs text-merah">{selectedPipeline.error.message}</p>
        )}
        {blockingQuotation && (
          <div role="alert" className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-kuning/40 bg-kuning-t px-3.5 py-3">
            <div className="min-w-0 text-sm text-gray-800">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                Lead ini masih punya quotation aktif
                <QuotationStatusLabel status={blockingQuotation.status} />
              </p>
              <p className="mt-0.5 text-gray-700">
                Lanjutkan {formatQuotationNumber(blockingQuotation)}. Versi baru baru bisa dibuat setelah quotation itu approved.
              </p>
            </div>
            <AppButton href={`/quotations/${blockingQuotation.id}`} variant="black" size="sm">
              Buka quotation
              <ArrowUpRight size={13} />
            </AppButton>
          </div>
        )}
        {currentQuotation?.status === "approved" && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
            <CopyPlus size={13} aria-hidden="true" />
            Ini akan jadi versi {currentQuotation.version + 1}. {formatQuotationNumber(currentQuotation)} tetap tersimpan sebagai versi lama.
          </p>
        )}
        {selectedPipelineId === null && (
          <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">
            Kosongkan kalau cuma mau hitung-hitungan cepat — ringkasan tetap
            bisa disalin, tapi hasilnya tidak tersimpan, tidak masuk approval
            Manager, dan PDF-nya baru bisa diunduh setelah tersimpan sebagai
            Quotation (dari halaman Quotations).
          </p>
        )}
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)] xl:items-start">
        <div className="flex min-w-0 flex-col gap-4">{editorBlocks}</div>

        <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-6">
          {builder.totalValueBox}
          {builder.priceBreakdownCard}
          {builder.costBreakdownCard}
          {builder.flagsBlock}
          {builder.copyButtonBlock}

          {selectedPipelineId !== null && (
            <div className="rounded-xl border border-line bg-card-bg p-4">
              <QuotationFlowStepperOS status={null} requiresReview={builder.requiresReview} />
            </div>
          )}

          <div className="flex gap-2">
            <AppButton
              type="button"
              variant="outline"
              className="flex-1 justify-center"
              disabled={isSavingDraft || isSubmittingQuotation || isCheckingPipeline || !!blockingQuotation}
              onClick={handleSaveDraft}
            >
              {isSavingDraft && <Loader2 size={14} className="animate-spin" />}
              Simpan draft
            </AppButton>
            <AppButton
              type="button"
              variant="primary"
              className="flex-1 justify-center"
              disabled={isSavingDraft || isSubmittingQuotation || isCheckingPipeline || !!blockingQuotation}
              onClick={handleSubmit}
            >
              {isSubmittingQuotation ? (
                <Loader2 size={14} className="animate-spin" />
              ) : builder.requiresReview ? (
                <Send size={14} />
              ) : (
                <Check size={14} />
              )}
              {builder.requiresReview ? "Buat & ajukan ke manager" : "Buat & approve"}
            </AppButton>
          </div>
          {selectedPipelineId !== null && !blockingQuotation && (
            <p className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-zinc-400">
              <Info size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              {builder.requiresReview
                ? "Custom scope atau margin di bawah 45% perlu persetujuan manager sebelum dikirim ke klien."
                : "Package dengan margin 45% ke atas disetujui otomatis dan langsung bisa dikirim ke klien."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
