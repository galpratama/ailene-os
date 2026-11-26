// Content and shared classes of the "Make AI stick." home (HomePageV2BIZ).

// Width and gutter come from --v2-wrap / --v2-gutter (globals.css), which grow from xl up.
export const V2_WRAP = "mx-auto w-full max-w-(--v2-wrap) px-5 sm:px-8 lg:px-(--v2-gutter)";
export const V2_SECTION = "py-[clamp(72px,10vw,136px)]";
export const V2_H2 =
  "font-jakarta text-[clamp(2.15rem,4.6vw,3.6rem)] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance";
export const V2_LEAD = "max-w-[56ch] text-[clamp(1.08rem,1.6vw,1.28rem)] leading-[1.55] text-v2-ink-2";
export const V2_SOURCE = "text-[0.8rem] leading-[1.45] text-v2-ink-3";
export const V2_TEXT_LINK =
  "font-bold text-v2-green underline decoration-v2-green/35 underline-offset-[0.28em] hover:decoration-v2-green";
export const V2_SAMPLE =
  "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-dashed border-current px-2.5 py-1 text-[0.76rem] font-bold text-v2-ink-3";

export const V2_H3 =
  "font-jakarta text-[clamp(1.55rem,2.6vw,2.15rem)] leading-[1.1] font-extrabold tracking-[-0.03em] text-balance";
export const V2_BODY = "max-w-[66ch] text-v2-ink-2";

export const V2_FORM_ANCHOR = "konsultasi";

// BIZ page identifiers used for the shared header's active navigation state.
export type V2Page = "home" | "sprint" | "lms" | "governance" | "articles" | "framework" | "specialist" | "case-study" | "join-trainer";

// Links to "/" stay plain anchors (full load) so the home experiment script runs on arrival.
export const v2Services = [
  { name: "Consult", short: "Readiness", hint: "Ailene Readiness: Ailene Score, use case prioritas, kebijakan AI", href: "/#layanan-consult" },
  { name: "Train", short: "Program", hint: "Program dari Komisaris sampai tim, pada pekerjaan nyata", href: "/#layanan-train" },
  { name: "Automate", short: "Workflow", hint: "Use case yang terbukti, jadi alur kerja otomatis", href: "/#layanan-automate" },
  { name: "Prove", short: "Rapor AI", hint: "Rapor AI tiap kuartal, per divisi", href: "/#rapor" },
] as const;

export const v2NavLinks: { label: string; hint?: string; href: string; page?: V2Page }[] = [
  { label: "Transformation Sprint", hint: "10 minggu", href: "/sprint", page: "sprint" },
  { label: "LMS", hint: "Platform belajar", href: "/lms", page: "lms" },
  { label: "Keamanan data", hint: "UU PDP", href: "/governance", page: "governance" },
  { label: "Artikel", href: "/articles", page: "articles" },
];

// Additional BIZ pages reachable from the shared header's "Lainnya" menu.
export const v2Resources: { name: string; hint: string; href: string; page?: V2Page }[] = [
  { name: "Framework", hint: "Peta kemampuan CFTE dan evaluasi Kirkpatrick", href: "/framework", page: "framework" },
  { name: "Specialist per divisi", hint: "Use case dan hasil lab untuk setiap fungsi", href: "/specialist", page: "specialist" },
];

export type RaporStatus = "ok" | "warn" | "risk";

// Board figures per quarter: [weekly active %, readiness, use cases, status] per division.
export const raporDivisions = ["Sales", "Finance", "Human Capital", "Operations", "Legal"] as const;
export const raporQuarters: {
  active: number;
  ready: number;
  hours: number;
  rows: [number, number, number, RaporStatus][];
}[] = [
  { active: 16, ready: 33, hours: 30, rows: [[22, 41, 1, "risk"], [18, 38, 0, "risk"], [20, 36, 1, "risk"], [12, 29, 0, "risk"], [8, 22, 0, "risk"]] },
  { active: 33, ready: 42, hours: 250, rows: [[45, 52, 4, "warn"], [41, 50, 3, "warn"], [38, 47, 2, "warn"], [24, 34, 2, "risk"], [15, 27, 1, "risk"]] },
  { active: 49, ready: 52, hours: 730, rows: [[63, 66, 9, "ok"], [66, 63, 8, "ok"], [52, 55, 5, "warn"], [33, 41, 5, "warn"], [30, 34, 2, "risk"]] },
  { active: 56, ready: 59, hours: 1240, rows: [[74, 79, 14, "ok"], [81, 72, 12, "ok"], [68, 61, 8, "ok"], [39, 44, 9, "warn"], [50, 40, 3, "risk"]] },
];

// label is the form option; prompt and hint are the closing band's wording of the same moment.
export const triggerMoments = [
  { value: "lisensi", label: "Lisensi AI sudah dibeli, pemakaiannya rendah", prompt: "Lisensi AI sudah dibeli, pemakaiannya rendah", hint: "Copilot, ChatGPT Enterprise, Gemini" },
  { value: "board", label: "Direksi bertanya apa hasil AI", prompt: "Direksi bertanya apa hasil AI", hint: "Butuh angka untuk rapat berikutnya" },
  { value: "rkap", label: "Menyusun anggaran AI tahun depan", prompt: "Menyusun anggaran AI tahun depan", hint: "RKAP atau rencana anggaran 2027" },
  { value: "start", label: "Pimpinan ingin mulai AI, belum tahu dari mana", prompt: "CEO bilang “kita perlu AI”", hint: "Belum tahu mulai dari mana" },
  { value: "pdp", label: "Khawatir soal data dan UU PDP", prompt: "Khawatir data pelanggan masuk ke AI publik", hint: "Kebijakan AI dan UU PDP" },
  { value: "lainnya", label: "Lainnya", prompt: "", hint: "" },
] as const;

export const serviceInterests = [
  { value: "consult", label: "Consult", hint: "Readiness dan roadmap" },
  { value: "train", label: "Train", hint: "Program pelatihan" },
  { value: "automate", label: "Automate", hint: "Workflow AI" },
  { value: "belum_tahu", label: "Belum tahu", hint: "Bantu saya memilih" },
] as const;

export const companySizes = [
  { value: "lt100", label: "Kurang dari 100" },
  { value: "100_500", label: "100–500" },
  { value: "500_1000", label: "500–1.000" },
  { value: "1000_5000", label: "1.000–5.000" },
  { value: "gt5000", label: "Lebih dari 5.000" },
] as const;

export type TriggerMoment = (typeof triggerMoments)[number]["value"];
export type ServiceInterest = (typeof serviceInterests)[number]["value"];

// A CTA elsewhere on the page pre-answers the form's first step before scrolling to it.
export const V2_PRESELECT_EVENT = "ailene:v2-preselect";
export type V2Preselect = { moment?: TriggerMoment; interest?: ServiceInterest };

export function preselectLeadForm(detail: V2Preselect) {
  window.dispatchEvent(new CustomEvent<V2Preselect>(V2_PRESELECT_EVENT, { detail }));
}

export function formatId(value: number): string {
  return Math.round(value).toLocaleString("id-ID");
}
