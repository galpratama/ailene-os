import type {
  MateriLevel,
  PricingState,
  SessionFormat,
  SesiValue,
  TrainerTier,
} from "@/lib/pricing-b2b";
import { MARGIN_FLOOR } from "@/lib/pricing-b2b";
import type {
  B2BQuotationMateriLevelEnum,
  B2BQuotationSessionFormatEnum,
  B2BQuotationSourceTypeEnum,
  B2BQuotationTrainerTierEnum,
} from "@prisma/client";

// Roles allowed to see a quotation's internal cost/margin figures — everyone else only gets client-facing ones.
const INTERNAL_VISIBILITY_ROLES = ["Manager", "Administrator", "Super Admin"];

export function canViewQuotationInternals(actor: {
  role: { name: string };
}): boolean {
  return INTERNAL_VISIBILITY_ROLES.includes(actor.role.name);
}

export type QuotationPricingInput = {
  days: {
    format: B2BQuotationSessionFormatEnum;
    sesi: number;
    peserta: number;
    trainer: B2BQuotationTrainerTierEnum;
  }[];
  materi: B2BQuotationMateriLevelEnum;
  bd_pct: number;
  dc_pct: number;
  addon_assessment: boolean;
  addon_klinik: boolean;
  addon_klinik_sesi: number;
  addon_rekaman: boolean;
  addon_sertifikat: boolean;
  addon_sertifikat_qty: number;
  addon_perjalanan: boolean;
  addon_perjalanan_rp: number;
};

// Prisma enum values are lib/pricing-b2b.ts's lowercase string-literal types, just upper-cased.
export function toPricingState(input: QuotationPricingInput): PricingState {
  return {
    days: input.days.map((day) => ({
      format: day.format.toLowerCase() as SessionFormat,
      sesi: day.sesi as SesiValue,
      peserta: day.peserta,
      trainer: day.trainer.toLowerCase() as TrainerTier,
    })),
    materi: input.materi.toLowerCase() as MateriLevel,
    addons: {
      assessment: input.addon_assessment,
      klinik: input.addon_klinik,
      klinikSesi: input.addon_klinik_sesi,
      rekaman: input.addon_rekaman,
      sertifikat: input.addon_sertifikat,
      sertifikatQty: input.addon_sertifikat_qty,
      perjalanan: input.addon_perjalanan,
      perjalananRp: input.addon_perjalanan_rp,
    },
    bdPct: input.bd_pct,
    dcPct: input.dc_pct,
  };
}

// Custom-scope or under the still-provisional margin floor routes to Manager Review; else auto-approves.
export function computeRequiresReview(
  sourceType: B2BQuotationSourceTypeEnum,
  marginPct: number
): boolean {
  return sourceType === "CUSTOM" || marginPct < MARGIN_FLOOR;
}
