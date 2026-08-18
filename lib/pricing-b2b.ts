// B2B pricing/quote logic, ported from the pricing calculator prototype; rates live here since this tool has no persistence yet.

export type SessionFormat = "offline" | "online";
export type TrainerTier = "certified" | "specialist" | "lead";
export type MateriLevel = "std" | "ringan" | "dalam";

// Canonical durations (1 sesi = 3 jam) — single source of truth for the DB column, tRPC validators, and the UI.
export const SESI_VALUES = [0.5, 1, 2, 3] as const;
export type SesiValue = (typeof SESI_VALUES)[number];

export const SESI_OPTIONS: { value: SesiValue; label: string; short: string }[] = [
  { value: 0.5, label: "Sesi pendek (1,5 jam)", short: "1,5 jam" },
  { value: 1, label: "Setengah hari (3 jam)", short: "3 jam" },
  { value: 2, label: "Sehari penuh (6 jam)", short: "6 jam" },
  { value: 3, label: "Diperpanjang (9 jam)", short: "9 jam" },
];

// Shared duration labels, so the breakdown card and the PDF never disagree.
export function sesiShortLabel(sesi: SesiValue): string {
  return SESI_OPTIONS.find((o) => o.value === sesi)?.short ?? `${sesi * 3} jam`;
}
export function sesiFullLabel(sesi: SesiValue): string {
  return SESI_OPTIONS.find((o) => o.value === sesi)?.label ?? `${sesi * 3} jam`;
}

export interface PricingDay {
  format: SessionFormat;
  sesi: SesiValue;
  peserta: number;
  trainer: TrainerTier;
}

export interface PricingAddons {
  assessment: boolean;
  klinik: boolean;
  klinikSesi: number;
  rekaman: boolean;
  sertifikat: boolean;
  sertifikatQty: number;
  perjalanan: boolean;
  perjalananRp: number;
}

export interface PricingState {
  days: PricingDay[];
  materi: MateriLevel;
  addons: PricingAddons;
  bdPct: number;
  dcPct: number;
}

export const RATE: Record<SessionFormat, number> = {
  offline: 17.5e6,
  online: 15.5e6,
};
export const INCL: Record<SessionFormat, number> = { offline: 15, online: 20 };
export const HEAD: Record<SessionFormat, number> = { offline: 0.75e6, online: 0.5e6 };
export const CAP: Record<SessionFormat, number> = { offline: 30, online: 40 };
export const LOG: Record<SessionFormat, number> = { offline: 1.5e6, online: 0.5e6 };

export const TR: Record<TrainerTier, number> = {
  certified: 5e6,
  specialist: 8e6,
  lead: 12e6,
};
export const TRN: Record<TrainerTier, string> = {
  certified: "Certified",
  specialist: "Specialist",
  lead: "Lead",
};
export const PREM: Record<TrainerTier, number> = {
  certified: 0,
  specialist: 0,
  lead: 2.5e6,
};

export const MP: Record<MateriLevel, number> = { std: 0, ringan: 2e6, dalam: 5e6 };
export const MC: Record<MateriLevel, number> = { std: 0, ringan: 0.8e6, dalam: 2e6 };
export const MN: Record<MateriLevel, string> = {
  std: "Standar",
  ringan: "Spesifik",
  dalam: "Deep Learning",
};

export const OPS_PCT = 0.1;
export const AMO_PCT = 0.05;
export const TAX_PCT = 0.005;
export const MARGIN_FLOOR = 0.45;

export const ADDON_PRICE = {
  assessment: 15e6,
  assessmentCost: 5e6,
  klinikPerSesi: 10e6,
  klinikPerSesiCost: 4e6,
  rekaman: 5e6,
  rekamanCost: 1e6,
  sertifikatPerOrang: 250e3,
  sertifikatPerOrangCost: 50e3,
};

export const PRESETS: Record<"foundation" | "intensive" | "sprint" | "blank", PricingDay[]> = {
  foundation: [{ format: "offline", sesi: 2, peserta: 15, trainer: "certified" }],
  intensive: [
    { format: "offline", sesi: 2, peserta: 18, trainer: "specialist" },
    { format: "offline", sesi: 2, peserta: 18, trainer: "specialist" },
  ],
  sprint: [
    { format: "offline", sesi: 2, peserta: 20, trainer: "lead" },
    { format: "offline", sesi: 2, peserta: 20, trainer: "specialist" },
    { format: "online", sesi: 2, peserta: 20, trainer: "specialist" },
    { format: "online", sesi: 2, peserta: 20, trainer: "certified" },
    { format: "offline", sesi: 1, peserta: 20, trainer: "lead" },
  ],
  blank: [{ format: "offline", sesi: 2, peserta: 15, trainer: "certified" }],
};

export function defaultAddons(): PricingAddons {
  return {
    assessment: false,
    klinik: false,
    klinikSesi: 1,
    rekaman: false,
    sertifikat: false,
    sertifikatQty: 0,
    perjalanan: false,
    perjalananRp: 10e6,
  };
}

export function defaultPricingState(): PricingState {
  return {
    days: PRESETS.blank.map((d) => ({ ...d })),
    materi: "std",
    addons: defaultAddons(),
    bdPct: 5,
    dcPct: 0,
  };
}

export function dayPrice(day: PricingDay, materi: MateriLevel): number {
  return (
    day.sesi * (RATE[day.format] + MP[materi] + (PREM[day.trainer] || 0)) +
    Math.max(0, day.peserta - INCL[day.format]) * HEAD[day.format] * day.sesi
  );
}

export function dayCost(day: PricingDay, materi: MateriLevel): number {
  const h = day.sesi / 2;
  return (
    TR[day.trainer] * h +
    (day.peserta > 20 ? 2e6 * h : 0) +
    LOG[day.format] * h +
    day.sesi * MC[materi]
  );
}

export function uniquePax(days: PricingDay[]): number {
  return days.reduce((max, d) => Math.max(max, d.peserta), 0);
}

export function addonsTotal(addons: PricingAddons) {
  let price = 0;
  let cost = 0;
  if (addons.assessment) {
    price += ADDON_PRICE.assessment;
    cost += ADDON_PRICE.assessmentCost;
  }
  if (addons.klinik) {
    price += ADDON_PRICE.klinikPerSesi * addons.klinikSesi;
    cost += ADDON_PRICE.klinikPerSesiCost * addons.klinikSesi;
  }
  if (addons.rekaman) {
    price += ADDON_PRICE.rekaman;
    cost += ADDON_PRICE.rekamanCost;
  }
  if (addons.sertifikat) {
    price += ADDON_PRICE.sertifikatPerOrang * addons.sertifikatQty;
    cost += ADDON_PRICE.sertifikatPerOrangCost * addons.sertifikatQty;
  }
  if (addons.perjalanan) {
    // Free-form total the BD enters directly, no auto markup, flows straight into price and cost.
    price += addons.perjalananRp;
    cost += addons.perjalananRp;
  }
  return { price, cost };
}

export interface PricingResult {
  subtotal: number;
  discount: number;
  netValue: number;
  trainerCost: number;
  addonsPrice: number;
  addonsCost: number;
  bdFee: number;
  opsFee: number;
  amoFee: number;
  totalCost: number;
  genesis: number;
  margin: number;
  invoice: number;
  pphTax: number;
  tax: number;
}

export function calculatePricing(state: PricingState): PricingResult {
  let dayTotal = 0;
  let costTotal = 0;
  state.days.forEach((d) => {
    dayTotal += dayPrice(d, state.materi);
    costTotal += dayCost(d, state.materi);
  });
  const addons = addonsTotal(state.addons);
  const subtotal = dayTotal + addons.price;
  const discount = subtotal * (state.dcPct / 100);
  const netValue = subtotal - discount;
  const bdFee = netValue * (state.bdPct / 100);
  const opsFee = netValue * OPS_PCT;
  const amoFee = netValue * AMO_PCT;
  const totalCost = costTotal + addons.cost + bdFee + opsFee + amoFee;
  const genesis = netValue - totalCost;
  // PPh Final 0,5% is grossed up so the amount received remains equal to netValue.
  const invoice = netValue / (1 - TAX_PCT);
  const pphTax = invoice * TAX_PCT;

  return {
    subtotal,
    discount,
    netValue,
    trainerCost: costTotal,
    addonsPrice: addons.price,
    addonsCost: addons.cost,
    bdFee,
    opsFee,
    amoFee,
    totalCost,
    genesis,
    margin: netValue > 0 ? genesis / netValue : 0,
    invoice,
    pphTax,
    tax: pphTax,
  };
}
