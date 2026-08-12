import type { InvoicePDFProps } from "@/components/pdf/InvoicePDF";
import {
  calculatePricing,
  MateriLevel,
  PricingAddons,
  PricingDay,
  SessionFormat,
  TrainerTier,
} from "@/lib/pricing-b2b";
import dayjs from "dayjs";

// Minimal, loosely-typed shape of trpc.read.b2b.quotation's response so callers avoid importing the full router type.
export type QuotationForPdf = {
  id: number;
  version: number;
  company_name: string;
  materi: string;
  bd_pct: number | string;
  dc_pct: number | string;
  addon_assessment: boolean;
  addon_klinik: boolean;
  addon_klinik_sesi: number;
  addon_rekaman: boolean;
  addon_sertifikat: boolean;
  addon_sertifikat_qty: number;
  addon_perjalanan: boolean;
  addon_perjalanan_rp: number | string;
  line_items: {
    format: string;
    sesi: number;
    peserta: number;
    trainer: string;
  }[];
  created_at: string | Date;
};

// Shared by the Pricing Calculator and the Quotations list so both produce identical PDFs.
export function buildInvoicePDFPropsFromQuotation(
  quotation: QuotationForPdf
): InvoicePDFProps {
  const days: PricingDay[] = quotation.line_items.map((item) => ({
    format: item.format.toLowerCase() as SessionFormat,
    sesi: item.sesi as 1 | 2 | 3,
    peserta: item.peserta,
    trainer: item.trainer.toLowerCase() as TrainerTier,
  }));
  const materi = quotation.materi.toLowerCase() as MateriLevel;
  const addons: PricingAddons = {
    assessment: quotation.addon_assessment,
    klinik: quotation.addon_klinik,
    klinikSesi: quotation.addon_klinik_sesi,
    rekaman: quotation.addon_rekaman,
    sertifikat: quotation.addon_sertifikat,
    sertifikatQty: quotation.addon_sertifikat_qty,
    perjalanan: quotation.addon_perjalanan,
    perjalananRp: Number(quotation.addon_perjalanan_rp),
  };
  const dcPct = Number(quotation.dc_pct);
  const bdPct = Number(quotation.bd_pct);
  const result = calculatePricing({ days, materi, addons, bdPct, dcPct });

  return {
    clientName: quotation.company_name,
    invoiceNumber: `INV/${dayjs(quotation.created_at).format("YYYYMMDD")}/${String(quotation.id).padStart(4, "0")}v${quotation.version}`,
    invoiceDate: dayjs().format("D MMMM YYYY"),
    days,
    materi,
    addons,
    dcPct,
    result,
  };
}

export function quotationPdfFilename(quotation: { id: number; company_name: string }) {
  const slug = quotation.company_name.trim().replace(/[^a-z0-9]+/gi, "-") || "quotation";
  return `${slug}-Q${quotation.id}.pdf`;
}
