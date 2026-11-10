import { CASE_STUDY_PUBLISHED, HUTAMA_KARYA_CASE_PATH } from "@/lib/biz-case-studies";
import {
  Calculator,
  CodeXml,
  Crown,
  Handshake,
  Headset,
  Megaphone,
  Scale,
  UsersRound,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export interface SpecialistDivision {
  id: string;
  name: string;
  short: string;
  icon: LucideIcon;
  audience: string;
  challenge: string;
  useCases: string[];
  labOutput: string;
  measure: string;
  tools: string[];
  caseStudyHref?: string;
}

// One entry per division; `id` is the anchor used by /specialist#<id> deep links from ads.
export const specialistDivisions: SpecialistDivision[] = [
  {
    id: "executive",
    name: "Executive & Leadership",
    short: "Executive",
    icon: Crown,
    audience: "Direksi, VP, dan kepala unit",
    challenge: "AI sudah dipakai di banyak tim, tetapi arah, prioritas, dan batas risikonya belum diputuskan.",
    useCases: [
      "Briefing eksekutif dari laporan dan notulen yang panjang",
      "Analisis skenario dan risiko sebelum keputusan",
      "Memilih use case AI dengan dampak terbesar per unit",
      "Menyusun kebijakan penggunaan AI dan data",
    ],
    labOutput: "Roadmap adopsi AI unit + memo keputusan",
    measure: "Use case berjalan dan waktu siap keputusan",
    tools: ["Copilot", "ChatGPT", "Claude"],
  },
  {
    id: "sales",
    name: "Sales & Business Development",
    short: "Sales",
    icon: Handshake,
    audience: "Account executive, BD, dan sales manager",
    challenge: "Waktu habis untuk riset akun dan administrasi, bukan untuk percakapan dengan calon klien.",
    useCases: [
      "Riset akun dan peta stakeholder sebelum meeting",
      "Outreach personal tanpa menulis dari nol",
      "Latihan objection handling bersama AI",
      "Draf proposal dan ringkasan call ke CRM",
    ],
    labOutput: "Account brief + rangkaian outreach siap kirim",
    measure: "Waktu riset per akun dan tingkat respons",
    tools: ["ChatGPT", "Gemini", "CRM"],
  },
  {
    id: "marketing",
    name: "Marketing & Communications",
    short: "Marketing",
    icon: Megaphone,
    audience: "Brand, content, performance, dan corporate comms",
    challenge: "Permintaan konten terus naik, sementara suara brand mudah melenceng saat diproduksi cepat.",
    useCases: [
      "Riset audiens dan pemetaan kompetitor",
      "Kalender konten dan variasi copy per kanal",
      "Brief kreatif, storyboard, dan aset visual",
      "Membaca performa kampanye dan menarik insight",
    ],
    labOutput: "Brand voice kit + kalender konten satu bulan",
    measure: "Waktu produksi dan jumlah aset per minggu",
    tools: ["ChatGPT", "Canva AI", "Gemini"],
  },
  {
    id: "hr",
    name: "Human Capital / HR",
    short: "HR",
    icon: UsersRound,
    audience: "HR ops, talent, learning, dan HRBP",
    challenge: "Pertanyaan karyawan, administrasi, dan laporan berulang menyita waktu, padahal datanya sensitif.",
    useCases: [
      "Asisten HR yang menjawab dari SOP dan kebijakan",
      "Job description, rubrik screening, dan pertanyaan interview",
      "Materi onboarding dan pengumuman internal",
      "Dashboard pipeline kandidat dan laporan terjadwal",
    ],
    labOutput: "Asisten HR berbasis SOP + dashboard kerja",
    measure: "Jam administrasi yang dihemat dan waktu respons",
    tools: ["Copilot", "ClickUp", "LMS Ailene"],
    caseStudyHref: CASE_STUDY_PUBLISHED ? HUTAMA_KARYA_CASE_PATH : undefined,
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    short: "Finance",
    icon: Calculator,
    audience: "Controller, FP&A, accounting, dan tax",
    challenge: "Angka harus benar. Tim butuh kecepatan AI tanpa kehilangan jejak pemeriksaan.",
    useCases: [
      "Komentar variance dan ringkasan laporan bulanan",
      "Cek anomali dan rekonsiliasi berbantuan AI",
      "Model skenario dan asumsi forecast",
      "Dokumentasi SOP closing yang bisa diaudit",
    ],
    labOutput: "Template variance analysis + daftar periksa verifikasi",
    measure: "Waktu penyusunan laporan dan temuan koreksi",
    tools: ["Copilot in Excel", "ChatGPT", "Claude"],
  },
  {
    id: "operations",
    name: "Operations & Procurement",
    short: "Operations",
    icon: Workflow,
    audience: "Operasional, supply chain, dan pengadaan",
    challenge: "Proses berjalan lewat banyak dokumen, tabel, dan laporan manual yang sulit distandarkan.",
    useCases: [
      "SOP dan checklist dari praktik yang sudah ada",
      "Perbandingan vendor dan draf RFQ",
      "Laporan operasional mingguan yang terkirim otomatis",
      "Menemukan bottleneck dari data proses",
    ],
    labOutput: "SOP digital + laporan mingguan terjadwal",
    measure: "Langkah manual yang hilang dan lead time laporan",
    tools: ["Copilot", "ClickUp", "Spreadsheet"],
  },
  {
    id: "it",
    name: "IT & Engineering",
    short: "IT",
    icon: CodeXml,
    audience: "Developer, infra, data, dan IT support",
    challenge: "Tim ingin agen dan koneksi data, tetapi akses dan keamanan harus tetap terkendali.",
    useCases: [
      "Coding assistant, code review, dan pengujian",
      "Dokumentasi, runbook, dan triage tiket",
      "Menyambungkan AI ke sistem lewat MCP dengan aman",
      "Audit akses agen sebelum dipakai tim lain",
    ],
    labOutput: "Workflow agen yang sudah diaudit + runbook",
    measure: "Lead time tiket dan cakupan dokumentasi",
    tools: ["Claude Code", "GitHub Copilot", "MCP"],
  },
  {
    id: "legal",
    name: "Legal & Compliance",
    short: "Legal",
    icon: Scale,
    audience: "Legal counsel, compliance, dan risk",
    challenge: "Dokumen bersifat rahasia dan satu kesalahan kutipan bisa mahal.",
    useCases: [
      "First-pass review kontrak dengan checklist klausul",
      "Ringkasan regulasi yang bisa ditelusuri ke sumber",
      "Template drafting untuk dokumen berulang",
      "Klasifikasi data sebelum masuk ke AI",
    ],
    labOutput: "Checklist klausul + kebijakan AI internal",
    measure: "Waktu review awal dan konsistensi dokumen",
    tools: ["Copilot", "Claude", "Traffic Light"],
  },
  {
    id: "customer-service",
    name: "Customer Service",
    short: "Customer Service",
    icon: Headset,
    audience: "Agent, team lead, dan QA layanan",
    challenge: "Volume pertanyaan tinggi dan jawaban antaragen sering tidak seragam.",
    useCases: [
      "Knowledge base dan FAQ dari dokumen internal",
      "Template balasan dengan nada yang konsisten",
      "Meringkas dan mengelompokkan keluhan",
      "QA percakapan dan bahan coaching agen",
    ],
    labOutput: "Knowledge base + makro balasan siap pakai",
    measure: "First response time dan konsistensi jawaban",
    tools: ["Copilot", "ChatGPT", "Helpdesk"],
  },
];
