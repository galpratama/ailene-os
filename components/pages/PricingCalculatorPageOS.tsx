"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import Label from "@/components/labels/Label";
import QuotationStatusLabel from "@/components/labels/QuotationStatusLabel";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { getRupiahCurrency } from "@/lib/currency";
import {
  ADDON_PRICE,
  CAP,
  MARGIN_FLOOR,
  MN,
  MP,
  PRESETS,
  PricingAddons,
  PricingDay,
  SessionFormat,
  TRN,
  TrainerTier,
  addonsTotal,
  calculatePricing,
  dayPrice,
  defaultAddons,
  uniquePax,
} from "@/lib/pricing-b2b";
import { setSessionToken, trpc } from "@/trpc/client";
import type {
  B2BQuotationPackageEnum,
  B2BQuotationSourceTypeEnum,
} from "@prisma/client";
import {
  Check,
  CircleAlert,
  CircleCheck,
  CircleX,
  Copy,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";

const REVIEW_ROLES = ["Manager", "Administrator", "Super Admin"];

const PACKAGE_BY_PRESET: Record<string, B2BQuotationPackageEnum> = {
  foundation: "FOUNDATION",
  intensive: "INTENSIVE",
  sprint: "SPRINT",
};

type LocalDay = PricingDay & { id: number };
type PresetKey = keyof typeof PRESETS;

let nextId = 1;
function withIds(days: PricingDay[]): LocalDay[] {
  return days.map((d) => ({ ...d, id: nextId++ }));
}

function segmentClass(active: boolean) {
  return `flex-1 h-8 rounded-md px-3 text-xs font-semibold transition-colors ${
    active
      ? "bg-lime-bright text-forest-deep"
      : "text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200"
  }`;
}

const presetOptions: { key: PresetKey; label: string; sub: string }[] = [
  {
    key: "foundation",
    label: "Paket Foundation",
    sub: "Pembelajaran 1 hari, bekali tim dengan dasar AI yang siap pakai",
  },
  {
    key: "intensive",
    label: "Paket Intensive",
    sub: "Pembelajaran 2 hari, praktik mendalam sesuai fungsi kerja tim",
  },
  {
    key: "sprint",
    label: "Paket Sprint",
    sub: "Pembelajaran 5 hari, transformasi AI menyeluruh untuk organisasi",
  },
  {
    key: "blank",
    label: "Custom",
    sub: "Susun sendiri hari dan format sesuai kebutuhan klien",
  },
];

const materiOptions: {
  key: keyof typeof MN;
  label: string;
  sub: string;
}[] = [
  { key: "std", label: "Standar", sub: "Materi siap pakai" },
  {
    key: "ringan",
    label: "Spesifik",
    sub: "Contoh dan studi kasus diganti sesuai industri klien",
  },
  {
    key: "dalam",
    label: "Deep Learning",
    sub: "Modul baru dibuat mengikuti workflow internal klien",
  },
];

const sesiOptions = [
  { value: 1, label: "Setengah hari (3 jam)" },
  { value: 2, label: "Sehari penuh (6 jam)" },
  { value: 3, label: "Diperpanjang (9 jam)" },
];

const trainerOptions = [
  { value: "certified", label: "Certified (Rp5jt/hari)" },
  { value: "specialist", label: "Specialist (Rp8jt/hari)" },
  { value: "lead", label: "Lead (Rp12jt/hari +premium)" },
];

const trainerOptionsWithoutCost = [
  { value: "certified", label: "Certified" },
  { value: "specialist", label: "Specialist" },
  { value: "lead", label: "Lead" },
];

const addonGridClass =
  "grid grid-cols-[20px_minmax(0,1fr)_52px_104px] items-center gap-2 sm:grid-cols-[20px_minmax(0,1fr)_64px_130px] sm:gap-3 [&>*]:min-w-0";

function ChoiceCard({
  label,
  sub,
  active,
  disabled,
  onClick,
}: {
  label: string;
  sub: string;
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? "border-claude bg-claude/10"
          : "border-gray-300 bg-gray-50 hover:border-gray-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
      }`}
    >
      <span
        className={`text-sm font-semibold ${
          active ? "text-claude" : "text-gray-900 dark:text-zinc-100"
        }`}
      >
        {label}
      </span>
      <span className="text-xs text-gray-500 dark:text-zinc-400">{sub}</span>
    </button>
  );
}

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

function BreakdownRow({
  label,
  value,
  negative,
  bold,
}: {
  label: ReactNode;
  value: string;
  negative?: boolean;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-1.5 text-sm ${
        bold
          ? "mt-1.5 border-t-2 border-gray-900 pt-2.5 font-bold text-gray-900 dark:border-zinc-100 dark:text-zinc-100"
          : "border-b border-gray-200 text-gray-700 last:border-0 dark:border-zinc-800 dark:text-zinc-300"
      }`}
    >
      <span className="min-w-0 truncate">{label}</span>
      <span
        className={`shrink-0 font-mono text-xs ${negative ? "text-merah" : ""}`}
      >
        {negative ? "−" : ""}
        {value}
      </span>
    </div>
  );
}

type FlagType = "stop" | "warn" | "ok";
const flagStyles: Record<FlagType, { box: string; icon: typeof CircleX }> = {
  stop: {
    box: "border-merah/40 bg-merah-t text-merah dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
    icon: CircleX,
  },
  warn: {
    box: "border-kuning/50 bg-kuning-t text-[#9a7a1a] dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300",
    icon: CircleAlert,
  },
  ok: {
    box: "border-hijau/40 bg-hijau-t text-[#5a8a2a] dark:border-green-800 dark:bg-green-950/40 dark:text-green-300",
    icon: CircleCheck,
  },
};

function Flag({ type, children }: { type: FlagType; children: ReactNode }) {
  const { box, icon: Icon } = flagStyles[type];
  return (
    <div
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${box}`}
    >
      <Icon size={15} className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function CopyButton({
  label,
  getText,
  variant = "primary",
}: {
  label: string;
  getText: () => string;
  variant?: "primary" | "outline";
}) {
  const [copied, setCopied] = useState(false);

  return (
    <AppButton
      variant={variant}
      size="md"
      className="w-full justify-center"
      onClick={async () => {
        await navigator.clipboard.writeText(getText());
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Tersalin" : label}
    </AppButton>
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

  const { data: sessionData } = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });

  const canViewCostDetails =
    !!sessionData && sessionData.user.role_name !== "Business Development";
  const canDecide =
    !!sessionData && REVIEW_ROLES.includes(sessionData.user.role_name);

  const utils = trpc.useUtils();
  // Deep-linked via ?pipeline_id= (new) or ?quotation_id= (existing), like /tasks?pipeline_id=.
  const searchParams = useSearchParams();
  const [quotationId, setQuotationId] = useState<number | null>(() => {
    const linked = searchParams.get("quotation_id");
    return linked ? Number(linked) : null;
  });
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(
    () => {
      const linked = searchParams.get("pipeline_id");
      return linked ? Number(linked) : null;
    }
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const needsPipelinePicker = quotationId === null && selectedPipelineId === null;
  const { data: pipelineData } = trpc.list.b2b.pipelines.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken && needsPipelinePicker }
  );
  const pipelineOptions: AppSelectOption[] =
    pipelineData?.list.map((p) => ({
      value: p.id,
      label: `${p.company_name} - ${p.name}`,
    })) ?? [];

  const { data: quotationData } = trpc.read.b2b.quotation.useQuery(
    { id: quotationId ?? 0 },
    { enabled: !!sessionToken && quotationId != null }
  );
  const quotation = quotationData?.quotation;
  const isEditable =
    !quotation || quotation.status === "DRAFT" || quotation.status === "NEEDS_REVISION";

  const [activePreset, setActivePreset] = useState<PresetKey>("blank");
  const [days, setDays] = useState<LocalDay[]>(() => withIds(PRESETS.blank));
  const [materi, setMateri] = useState<keyof typeof MN>("std");
  const [addons, setAddons] = useState<PricingAddons>(defaultAddons());
  const [bdPct, setBdPct] = useState(5);
  const [dcPct, setDcPct] = useState(0);

  const result = useMemo(
    () => calculatePricing({ days, materi, addons, bdPct, dcPct }),
    [days, materi, addons, bdPct, dcPct]
  );
  const addonsBreakdown = useMemo(() => addonsTotal(addons), [addons]);
  const totalSesi = days.reduce((a, d) => a + d.sesi, 0);
  const pax = uniquePax(days);

  // Synced to pax during render (not an effect) so manual edits stick until pax changes again.
  const [syncedPax, setSyncedPax] = useState(pax);
  if (pax !== syncedPax) {
    setSyncedPax(pax);
    setAddons((a) => ({ ...a, sertifikatQty: pax }));
  }

  // Seed the builder once per loaded quotation, adjusting state during render (this project's pattern).
  const [seededQuotationId, setSeededQuotationId] = useState<number | null>(
    null
  );
  if (quotation && quotation.id !== seededQuotationId) {
    setSeededQuotationId(quotation.id);
    setDays(
      withIds(
        quotation.line_items.map((item) => ({
          format: item.format.toLowerCase() as SessionFormat,
          sesi: item.sesi as 1 | 2 | 3,
          peserta: item.peserta,
          trainer: item.trainer.toLowerCase() as TrainerTier,
        }))
      )
    );
    setMateri(quotation.materi.toLowerCase() as keyof typeof MN);
    setAddons({
      assessment: quotation.addon_assessment,
      klinik: quotation.addon_klinik,
      klinikSesi: quotation.addon_klinik_sesi,
      rekaman: quotation.addon_rekaman,
      sertifikat: quotation.addon_sertifikat,
      sertifikatQty: quotation.addon_sertifikat_qty,
      perjalanan: quotation.addon_perjalanan,
      perjalananRp: Number(quotation.addon_perjalanan_rp),
    });
    setBdPct(Number(quotation.bd_pct));
    setDcPct(Number(quotation.dc_pct));
    setActivePreset(
      quotation.source_type === "CUSTOM"
        ? "blank"
        : ((quotation.package_type?.toLowerCase() ?? "blank") as PresetKey)
    );
  }

  function invalidateQuotationQueries() {
    utils.list.b2b.quotations.invalidate();
    utils.list.b2b.quotationApprovalQueue.invalidate();
    utils.list.b2b.homeSummary.invalidate();
    if (quotationId != null) {
      utils.read.b2b.quotation.invalidate({ id: quotationId });
    }
  }

  const createQuotation = trpc.create.b2b.quotation.useMutation();
  const updateQuotation = trpc.update.b2b.quotation.useMutation();
  const submitQuotationMutation = trpc.update.b2b.submitQuotation.useMutation();
  const outcomeQuotationMutation =
    trpc.update.b2b.updateQuotationOutcome.useMutation({
      onError: (err) => setSaveError(err.message),
    });

  function buildQuotationPayload() {
    const sourceType: B2BQuotationSourceTypeEnum =
      activePreset === "blank" ? "CUSTOM" : "PACKAGE";
    return {
      source_type: sourceType,
      package_type:
        sourceType === "PACKAGE" ? PACKAGE_BY_PRESET[activePreset] : undefined,
      materi: materi.toUpperCase() as "STD" | "RINGAN" | "DALAM",
      bd_pct: bdPct,
      dc_pct: dcPct,
      addon_assessment: addons.assessment,
      addon_klinik: addons.klinik,
      addon_klinik_sesi: addons.klinikSesi,
      addon_rekaman: addons.rekaman,
      addon_sertifikat: addons.sertifikat,
      addon_sertifikat_qty: addons.sertifikatQty,
      addon_perjalanan: addons.perjalanan,
      addon_perjalanan_rp: addons.perjalananRp,
      days: days.map((d) => ({
        format: d.format.toUpperCase() as "OFFLINE" | "ONLINE",
        sesi: d.sesi,
        peserta: d.peserta,
        trainer: d.trainer.toUpperCase() as "CERTIFIED" | "SPECIALIST" | "LEAD",
      })),
    };
  }

  // Separate flags since Simpan Draft and Buat Quotation share the same underlying mutation.
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmittingQuotation, setIsSubmittingQuotation] = useState(false);

  async function handleSaveDraft() {
    setSaveError(null);
    setIsSavingDraft(true);
    try {
      const payload = buildQuotationPayload();
      if (quotationId != null) {
        await updateQuotation.mutateAsync({ id: quotationId, ...payload });
      } else {
        if (!selectedPipelineId) {
          setSaveError("Pilih lead untuk menyimpan ini sebagai Quotation.");
          return;
        }
        const created = await createQuotation.mutateAsync({
          pipeline_id: selectedPipelineId,
          ...payload,
        });
        setQuotationId(created.id);
      }
      invalidateQuotationQueries();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Gagal menyimpan draft.");
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handleSubmit() {
    setSaveError(null);
    setIsSubmittingQuotation(true);
    try {
      const payload = buildQuotationPayload();
      let targetId = quotationId;
      if (targetId != null) {
        await updateQuotation.mutateAsync({ id: targetId, ...payload });
      } else {
        if (!selectedPipelineId) {
          setSaveError("Pilih lead untuk menyimpan ini sebagai Quotation.");
          return;
        }
        const created = await createQuotation.mutateAsync({
          pipeline_id: selectedPipelineId,
          ...payload,
        });
        targetId = created.id;
        setQuotationId(created.id);
      }
      await submitQuotationMutation.mutateAsync({ id: targetId });
      invalidateQuotationQueries();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Gagal membuat quotation."
      );
    } finally {
      setIsSubmittingQuotation(false);
    }
  }

  function handleOutcome(status: "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED") {
    if (!quotation) return;
    outcomeQuotationMutation.mutate(
      { id: quotation.id, status },
      { onSuccess: invalidateQuotationQueries }
    );
  }

  function applyPreset(key: PresetKey) {
    setActivePreset(key);
    setDays(withIds(PRESETS[key]));
  }

  function updateDay(id: number, patch: Partial<PricingDay>) {
    setDays((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }

  function removeDay(id: number) {
    setDays((prev) =>
      prev.length > 1 ? prev.filter((d) => d.id !== id) : prev
    );
  }

  function addDay() {
    const last = days[days.length - 1];
    setDays((prev) => [
      ...prev,
      {
        id: nextId++,
        format: last.format,
        sesi: last.sesi,
        peserta: last.peserta,
        trainer: last.trainer,
      },
    ]);
  }

  const margin = result.margin;
  const marginPct = Math.max(0, Math.min(100, margin * 100));
  const marginColor =
    margin < MARGIN_FLOOR
      ? "bg-merah"
      : margin < 0.5
        ? "bg-kuning"
        : "bg-hijau";
  const marginMessage =
    margin < MARGIN_FLOOR
      ? "Di bawah batas 45%. Tidak bisa dikirim tanpa persetujuan Genesis."
      : margin < 0.5
        ? "Tipis tapi lolos batas. Boleh dikirim."
        : "Sehat. Boleh langsung dikirim.";

  const flags: { type: FlagType; message: string }[] = [];
  if (margin < MARGIN_FLOOR) {
    flags.push({
      type: "stop",
      message: `Margin ${(margin * 100).toFixed(1)}% di bawah batas 45%. Naikkan harga, kurangi diskon, atau turunkan tingkat trainer.`,
    });
  }
  days.forEach((d, i) => {
    if (d.peserta > CAP[d.format]) {
      flags.push({
        type: "warn",
        message: `Hari ${i + 1}: ${d.peserta} peserta melebihi kapasitas ${d.format} (${CAP[d.format]}). Pecah jadi dua batch.`,
      });
    }
  });
  if (dcPct > 0) {
    flags.push({
      type: "warn",
      message: `Diskon ${dcPct}% butuh persetujuan Genesis. Catat alasannya.`,
    });
  }
  if (bdPct > 15) {
    flags.push({
      type: "warn",
      message: `Komisi ${bdPct}% di atas tier standar. Butuh persetujuan.`,
    });
  }
  const isMixed =
    days.some((d) => d.format === "offline") &&
    days.some((d) => d.format === "online");
  if (isMixed) {
    flags.push({
      type: "ok",
      message:
        "Format campuran. Pastikan penawaran mencantumkan hari mana offline dan mana online.",
    });
  }
  if (flags.length === 0) {
    flags.push({
      type: "ok",
      message: "Semua aman. Penawaran bisa langsung dikirim.",
    });
  }

  function internalText() {
    let t = "RINGKASAN INTERNAL\n\n";
    t += `Nilai program : ${getRupiahCurrency(result.netValue)}\n`;
    if (canViewCostDetails) {
      t += `Biaya         : ${getRupiahCurrency(result.trainerCost + result.addonsCost)}\n`;
      t += `Komisi BD     : ${getRupiahCurrency(result.bdFee)} (${bdPct}%)\n`;
      t += `Ops + AM      : ${getRupiahCurrency(result.opsFee)}\n`;
      t += `Amortisasi    : ${getRupiahCurrency(result.amoFee)}\n`;
    } else {
      t += `Total Biaya   : ${getRupiahCurrency(result.totalCost)}\n`;
    }
    t += `Net Profit    : ${getRupiahCurrency(result.genesis)} (${(margin * 100).toFixed(1)}%)\n`;
    t += `Invoice       : ${getRupiahCurrency(result.invoice)} (gross up PPh 0,5%)\n`;
    t +=
      margin < MARGIN_FLOOR
        ? "\nSTATUS: perlu approval, di bawah 45%\n"
        : "\nSTATUS: aman\n";
    return t;
  }

  return (
    <div className="flex min-w-0 flex-col gap-5 overflow-x-hidden px-4 py-6 sm:px-8">
      <PageHeaderOS
        title="Pricing Calculator"
        description="Susun penawaran program AI per hari. Harga, biaya, dan net margin dihitung langsung."
      />

      {quotation ? (
        <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-gray-300 bg-card-bg px-4 py-3 dark:border-zinc-700">
          <span className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
            {quotation.company_name} · {quotation.pipeline_name}
          </span>
          <span className="text-xs text-gray-400">v{quotation.version}</span>
          <QuotationStatusLabel status={quotation.status} />
          {!isEditable && (
            <span className="text-xs text-gray-400 dark:text-zinc-500">
              Sudah tidak bisa diubah — versi ini terkunci.
            </span>
          )}
        </div>
      ) : (
        needsPipelinePicker && (
          <div className="rounded-xl border border-gray-300 bg-card-bg p-4 dark:border-zinc-700">
            <AppSelect
              selectId="quotation-pipeline-picker"
              label="Pilih Lead"
              placeholder="Pilih lead supaya tersimpan sebagai Quotation"
              value={selectedPipelineId}
              onChange={(v) => setSelectedPipelineId(v as number | null)}
              options={pipelineOptions}
            />
            <p className="mt-2 text-xs text-gray-400 dark:text-zinc-500">
              Kosongkan kalau cuma mau hitung-hitungan cepat — ringkasan
              tetap bisa disalin, tapi hasilnya tidak tersimpan, tidak masuk
              approval Manager, dan PDF-nya baru bisa diunduh setelah
              tersimpan sebagai Quotation (dari halaman Quotations).
            </p>
          </div>
        )
      )}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,1fr)] xl:items-start">
        {/* Left: builder */}
        <div className="flex min-w-0 flex-col gap-4">
          <Block step={1} title="Pilih Paket">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {presetOptions.map((p) => (
                <ChoiceCard
                  key={p.key}
                  label={p.label}
                  sub={p.sub}
                  active={activePreset === p.key}
                  disabled={!isEditable}
                  onClick={() => applyPreset(p.key)}
                />
              ))}
            </div>
          </Block>

          <Block step={2} title="Susunan hari">
            <div className="flex flex-col gap-3">
              {days.map((d, i) => (
                <div
                  key={d.id}
                  className={`rounded-lg border ${
                    d.format === "offline"
                      ? "border-oranye/30 dark:border-orange-800"
                      : "border-biru/40 dark:border-blue-800"
                  }`}
                >
                  <div
                    className={`flex flex-wrap items-center gap-2.5 rounded-t-lg px-3 py-2 ${
                      d.format === "offline"
                        ? "bg-oranye-t dark:bg-orange-950/40"
                        : "bg-biru-t dark:bg-blue-950/40"
                    }`}
                  >
                    <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                      Hari {i + 1}
                    </span>
                    <div className="flex rounded-md border border-gray-900/15 bg-white p-0.5 dark:border-white/10 dark:bg-zinc-900">
                      <button
                        type="button"
                        disabled={!isEditable}
                        onClick={() =>
                          updateDay(d.id, {
                            format: "offline" as SessionFormat,
                          })
                        }
                        className={`${segmentClass(d.format === "offline")} disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        Offline
                      </button>
                      <button
                        type="button"
                        disabled={!isEditable}
                        onClick={() =>
                          updateDay(d.id, { format: "online" as SessionFormat })
                        }
                        className={`${segmentClass(d.format === "online")} disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        Online
                      </button>
                    </div>
                    <span className="ml-auto font-mono text-sm font-bold text-gray-900 dark:text-zinc-100">
                      {getRupiahCurrency(dayPrice(d, materi))}
                    </span>
                    {days.length > 1 && isEditable && (
                      <button
                        type="button"
                        onClick={() => removeDay(d.id)}
                        title="Hapus hari"
                        className="text-gray-500 hover:text-merah dark:text-zinc-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-3 rounded-b-lg bg-card-bg p-3">
                    <AppSelect
                      selectId={`day-${d.id}-sesi`}
                      label="Durasi"
                      placeholder="Pilih durasi"
                      value={d.sesi}
                      disabled={!isEditable}
                      options={sesiOptions}
                      onChange={(v) =>
                        updateDay(d.id, { sesi: Number(v) as 1 | 2 | 3 })
                      }
                    />
                    <AppNumberInput
                      inputId={`day-${d.id}-peserta`}
                      label="Peserta"
                      value={String(d.peserta)}
                      disabled={!isEditable}
                      onValueChange={(v) =>
                        updateDay(d.id, {
                          peserta: Math.max(1, parseInt(v || "1", 10)),
                        })
                      }
                    />
                    <AppSelect
                      selectId={`day-${d.id}-trainer`}
                      label="Trainer"
                      placeholder="Pilih trainer"
                      value={d.trainer}
                      disabled={!isEditable}
                      options={
                        canViewCostDetails
                          ? trainerOptions
                          : trainerOptionsWithoutCost
                      }
                      onChange={(v) =>
                        updateDay(d.id, { trainer: v as TrainerTier })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
            {isEditable && (
              <button
                type="button"
                onClick={addDay}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:border-claude hover:text-claude dark:border-zinc-700 dark:text-zinc-400"
              >
                <Plus size={14} /> Tambah hari
              </button>
            )}
          </Block>

          <Block
            step={3}
            title="Materi"
            side={`${getRupiahCurrency(MP[materi])}/sesi`}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {materiOptions.map((m) => (
                <ChoiceCard
                  key={m.key}
                  label={m.label}
                  sub={m.sub}
                  active={materi === m.key}
                  disabled={!isEditable}
                  onClick={() => setMateri(m.key)}
                />
              ))}
            </div>
          </Block>

          <Block
            step={4}
            title="Add ons"
            side={getRupiahCurrency(addonsBreakdown.price)}
          >
            <div className="flex flex-col">
              <div
                className={`${addonGridClass} pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-zinc-500`}
              >
                <span />
                <span>Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Harga</span>
              </div>

              <div
                className={`${addonGridClass} border-b border-gray-200 py-2.5 dark:border-zinc-800`}
              >
                <input
                  type="checkbox"
                  checked={addons.assessment}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setAddons((a) => ({ ...a, assessment: e.target.checked }))
                  }
                  className="size-4 shrink-0 accent-claude disabled:opacity-60"
                />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 dark:text-zinc-200">
                    AI Readiness Assessment
                  </p>
                  <p className="text-xs text-gray-400">
                    survei dan wawancara sebelum program
                  </p>
                </div>
                <span />
                <span className="text-right font-mono text-xs font-semibold text-gray-600 dark:text-zinc-400">
                  {getRupiahCurrency(ADDON_PRICE.assessment)}
                </span>
              </div>

              <div
                className={`${addonGridClass} border-b border-gray-200 py-2.5 dark:border-zinc-800`}
              >
                <input
                  type="checkbox"
                  checked={addons.klinik}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setAddons((a) => ({ ...a, klinik: e.target.checked }))
                  }
                  className="size-4 shrink-0 accent-claude disabled:opacity-60"
                />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 dark:text-zinc-200">
                    Klinik lanjutan
                  </p>
                  <p className="text-xs text-gray-400">
                    pendampingan setelah training
                  </p>
                </div>
                <AppNumberInput
                  inputId="addon-klinik-sesi"
                  value={String(addons.klinikSesi)}
                  disabled={!isEditable}
                  onValueChange={(v) =>
                    setAddons((a) => ({
                      ...a,
                      klinikSesi: Math.max(1, parseInt(v || "1", 10)),
                    }))
                  }
                  className="py-1.5 text-center"
                />
                <span className="text-right font-mono text-xs font-semibold text-gray-600 dark:text-zinc-400">
                  {getRupiahCurrency(
                    ADDON_PRICE.klinikPerSesi * addons.klinikSesi
                  )}
                </span>
              </div>

              <div
                className={`${addonGridClass} border-b border-gray-200 py-2.5 dark:border-zinc-800`}
              >
                <input
                  type="checkbox"
                  checked={addons.rekaman}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setAddons((a) => ({ ...a, rekaman: e.target.checked }))
                  }
                  className="size-4 shrink-0 accent-claude disabled:opacity-60"
                />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 dark:text-zinc-200">
                    Rekaman + akses LMS
                  </p>
                  <p className="text-xs text-gray-400">
                    6 bulan untuk semua peserta
                  </p>
                </div>
                <span />
                <span className="text-right font-mono text-xs font-semibold text-gray-600 dark:text-zinc-400">
                  {getRupiahCurrency(ADDON_PRICE.rekaman)}
                </span>
              </div>

              <div
                className={`${addonGridClass} border-b border-gray-200 py-2.5 dark:border-zinc-800`}
              >
                <input
                  type="checkbox"
                  checked={addons.sertifikat}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setAddons((a) => ({ ...a, sertifikat: e.target.checked }))
                  }
                  className="size-4 shrink-0 accent-claude disabled:opacity-60"
                />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 dark:text-zinc-200">
                    Sertifikat
                  </p>
                  <p className="text-xs text-gray-400">
                    per peserta unik, mengikuti Susunan hari
                  </p>
                </div>
                <AppNumberInput
                  inputId="addon-sertifikat-qty"
                  value={String(addons.sertifikatQty)}
                  disabled={!isEditable}
                  onValueChange={(v) =>
                    setAddons((a) => ({
                      ...a,
                      sertifikatQty: Math.max(0, parseInt(v || "0", 10)),
                    }))
                  }
                  title="Mengikuti jumlah peserta di Susunan hari, bisa diedit manual"
                  className="py-1.5 text-center"
                />
                <span className="text-right font-mono text-xs font-semibold text-gray-600 dark:text-zinc-400">
                  {getRupiahCurrency(
                    ADDON_PRICE.sertifikatPerOrang * addons.sertifikatQty
                  )}
                </span>
              </div>

              <div className={`${addonGridClass} py-2.5`}>
                <input
                  type="checkbox"
                  checked={addons.perjalanan}
                  disabled={!isEditable}
                  onChange={(e) =>
                    setAddons((a) => ({ ...a, perjalanan: e.target.checked }))
                  }
                  className="size-4 shrink-0 accent-claude disabled:opacity-60"
                />
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 dark:text-zinc-200">
                    Perjalanan luar kota
                  </p>
                  <p className="text-xs text-gray-400">
                    tiket, hotel, transport lokal, isi total sesuai kebutuhan
                  </p>
                </div>
                <span />
                <AppNumberInput
                  inputId="addon-perjalanan-rp"
                  value={String(addons.perjalananRp)}
                  disabled={!isEditable}
                  onValueChange={(v) =>
                    setAddons((a) => ({
                      ...a,
                      perjalananRp: Math.max(0, parseInt(v || "0", 10)),
                    }))
                  }
                  icon={
                    <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                      Rp
                    </span>
                  }
                  className="py-1.5"
                />
              </div>
            </div>
          </Block>

          <Block step={5} title="Komersial">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>*]:min-w-0">
              <AppInput
                inputId="bd-pct"
                label="Komisi BD (%)"
                type="number"
                min={0}
                max={25}
                step={0.5}
                disabled={!isEditable}
                value={bdPct}
                onChange={(e) =>
                  setBdPct(
                    Math.max(0, Math.min(25, parseFloat(e.target.value) || 0))
                  )
                }
              />
              <AppInput
                inputId="dc-pct"
                label="Diskon (%)"
                type="number"
                min={0}
                max={30}
                step={1}
                disabled={!isEditable}
                value={dcPct}
                onChange={(e) =>
                  setDcPct(
                    Math.max(0, Math.min(30, parseFloat(e.target.value) || 0))
                  )
                }
              />
            </div>
          </Block>
        </div>

        {/* Right: live quote */}
        <div className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-6">
          <div className="rounded-xl border border-gray-900 bg-gray-900 p-5 text-white dark:border-zinc-700 dark:bg-zinc-800">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
              Nilai program
            </p>
            <p className="mt-1.5 text-[34px] font-bold leading-none">
              {getRupiahCurrency(result.netValue)}
            </p>
            <p className="mt-1.5 text-xs text-white/60">
              {dcPct > 0
                ? `sebelum diskon ${getRupiahCurrency(result.subtotal)} · `
                : ""}
              {days.length} hari · {totalSesi} sesi
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/15 pt-2.5 text-sm">
              <span>PPh Final 0,5% (gross up)</span>
              <span className="font-mono font-semibold">
                {getRupiahCurrency(result.pphTax)}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between border-t-2 border-coral pt-2.5 text-base font-bold">
              <span>Total invoice</span>
              <span className="font-mono">
                {getRupiahCurrency(result.invoice)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-gray-300 bg-card-bg p-4 dark:border-zinc-700">
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Net Margin
              </span>
              <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                {(margin * 100).toFixed(1)}%
              </span>
            </div>
            <div className="relative h-3.5 overflow-hidden rounded-full bg-gray-100 dark:bg-zinc-800">
              <div
                className={`h-full transition-[width] ${marginColor}`}
                style={{ width: `${marginPct}%` }}
              />
              <div
                className="absolute inset-y-0 w-0.5 bg-gray-900 dark:bg-zinc-100"
                style={{ left: "45%" }}
              />
            </div>
            <p
              className="relative mt-1 h-3.5 font-mono text-[10px] text-gray-400"
              style={{ left: "calc(45% - 14px)" }}
            >
              batas 45%
            </p>
            <p className="mt-2.5 text-sm text-gray-700 dark:text-zinc-300">
              {marginMessage}
            </p>
          </div>

          <div className="rounded-xl border border-gray-300 bg-card-bg p-4 dark:border-zinc-700">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Rincian
            </h4>
            {days.map((d, i) => (
              <BreakdownRow
                key={d.id}
                label={
                  <span className="flex items-center gap-1.5">
                    <Label variant={d.format === "offline" ? "oranye" : "biru"}>
                      {d.format === "offline" ? "Offline" : "Online"}
                    </Label>
                    <span className="font-semibold text-gray-900 dark:text-zinc-100">
                      Hari {i + 1}
                    </span>
                    <span className="text-xs text-gray-400">
                      ·{" "}
                      {d.sesi === 1
                        ? "½ hari"
                        : d.sesi === 2
                          ? "1 hari"
                          : "1½ hari"}{" "}
                      · {d.peserta} org · {TRN[d.trainer]}
                    </span>
                  </span>
                }
                value={getRupiahCurrency(dayPrice(d, materi))}
              />
            ))}
            {addons.assessment && (
              <BreakdownRow
                label="AI Readiness Assessment"
                value={getRupiahCurrency(ADDON_PRICE.assessment)}
              />
            )}
            {addons.klinik && (
              <BreakdownRow
                label={`Klinik lanjutan ×${addons.klinikSesi}`}
                value={getRupiahCurrency(
                  ADDON_PRICE.klinikPerSesi * addons.klinikSesi
                )}
              />
            )}
            {addons.rekaman && (
              <BreakdownRow
                label="Rekaman + LMS"
                value={getRupiahCurrency(ADDON_PRICE.rekaman)}
              />
            )}
            {addons.sertifikat && (
              <BreakdownRow
                label={`Sertifikat ×${addons.sertifikatQty}`}
                value={getRupiahCurrency(
                  ADDON_PRICE.sertifikatPerOrang * addons.sertifikatQty
                )}
              />
            )}
            {addons.perjalanan && (
              <BreakdownRow
                label="Perjalanan luar kota"
                value={getRupiahCurrency(addons.perjalananRp)}
              />
            )}
            {dcPct > 0 && (
              <BreakdownRow
                label={`Diskon ${dcPct}%`}
                value={getRupiahCurrency(result.discount)}
                negative
              />
            )}
            <BreakdownRow
              label="Nilai program"
              value={getRupiahCurrency(result.netValue)}
              bold
            />
          </div>

          <div className="rounded-xl border border-gray-300 bg-card-bg p-4 dark:border-zinc-700">
            <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Biaya dan bagi hasil
            </h4>
            {canViewCostDetails ? (
              <>
                <BreakdownRow
                  label="Trainer, asisten, logistik"
                  value={getRupiahCurrency(result.trainerCost)}
                  negative
                />
                {addonsBreakdown.cost > 0 && (
                  <BreakdownRow
                    label="Biaya tambahan"
                    value={getRupiahCurrency(result.addonsCost)}
                    negative
                  />
                )}
                <BreakdownRow
                  label={`Komisi BD ${bdPct}%`}
                  value={getRupiahCurrency(result.bdFee)}
                  negative
                />
                <BreakdownRow
                  label="Operasional & AM 10%"
                  value={getRupiahCurrency(result.opsFee)}
                  negative
                />
                <BreakdownRow
                  label="Amortisasi materi 5%"
                  value={getRupiahCurrency(result.amoFee)}
                  negative
                />
                <BreakdownRow
                  label="Net Profit"
                  value={getRupiahCurrency(result.genesis)}
                  bold
                />
              </>
            ) : (
              <BreakdownRow
                label="Total biaya"
                value={getRupiahCurrency(result.totalCost)}
                bold
              />
            )}
          </div>

          <div className="flex flex-col gap-2">
            {flags.map((f, i) => (
              <Flag key={i} type={f.type}>
                {f.message}
              </Flag>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <CopyButton
              label="Salin ringkasan internal"
              getText={internalText}
              variant="outline"
            />
          </div>

          {saveError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {saveError}
            </p>
          )}

          {quotation && quotation.approvals.length > 0 && (
            <div className="flex flex-col gap-2 rounded-xl border border-gray-300 bg-card-bg p-4 dark:border-zinc-700">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Riwayat approval
              </h4>
              {quotation.approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-zinc-800"
                >
                  <p className="font-semibold text-gray-700 dark:text-zinc-300">
                    {approval.decision} · {approval.actor_name}
                  </p>
                  {approval.reason && (
                    <p className="mt-0.5 text-gray-500 dark:text-zinc-400">
                      {approval.reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {isEditable && (
            <div className="flex gap-2">
              <AppButton
                type="button"
                variant="outline"
                className="flex-1 justify-center"
                disabled={isSavingDraft || isSubmittingQuotation}
                onClick={handleSaveDraft}
              >
                {isSavingDraft && (
                  <Loader2 size={14} className="animate-spin" />
                )}
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
          )}

          {/* Approve/Needs Revision/Reject now happens from the Quotations
              list's review queue, not here — this is just a status note. */}
          {quotation?.status === "MANAGER_REVIEW" && (
            <p className="rounded-lg border border-kuning/40 bg-kuning-t px-3 py-2 text-sm text-gray-700">
              {canDecide ? (
                <>
                  Menunggu keputusan Manager — kelola dari halaman{" "}
                  <Link href="/quotations" className="font-semibold underline">
                    Quotations
                  </Link>
                  .
                </>
              ) : (
                "Menunggu keputusan Manager."
              )}
            </p>
          )}

          {quotation?.status === "APPROVED" && (
            <AppButton
              type="button"
              variant="primary"
              disabled={outcomeQuotationMutation.isPending}
              onClick={() => handleOutcome("SENT")}
            >
              Mark as Sent
            </AppButton>
          )}

          {quotation?.status === "SENT" && (
            <div className="flex gap-2">
              <AppButton
                type="button"
                variant="primary"
                size="sm"
                className="flex-1 justify-center"
                disabled={outcomeQuotationMutation.isPending}
                onClick={() => handleOutcome("ACCEPTED")}
              >
                Accepted
              </AppButton>
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 justify-center"
                disabled={outcomeQuotationMutation.isPending}
                onClick={() => handleOutcome("REJECTED")}
              >
                Rejected
              </AppButton>
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 justify-center"
                disabled={outcomeQuotationMutation.isPending}
                onClick={() => handleOutcome("EXPIRED")}
              >
                Expired
              </AppButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
