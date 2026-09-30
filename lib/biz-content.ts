// Shared by the rendered sections and the JSON-LD, so the two can't drift apart.

export const programs = [
  {
    id: "foundation",
    name: "Paket Foundation",
    duration: "1 hari",
    format: "Full offline",
    participants: "Mulai 15 orang",
    fit: "Tim yang baru mulai memakai AI",
    output: "Prompt library starter · Workflow examples · Use-case shortlist",
    recommended: false,
  },
  {
    id: "intensive",
    name: "Paket Acceleration",
    duration: "2 hari",
    format: "Hybrid",
    participants: "Mulai 15 orang",
    fit: "Tim yang ingin menerapkan workflow sesuai fungsi",
    output:
      "Use-case map · Prompt library per role · Implementation action plan",
    recommended: false,
  },
  {
    id: "sprint",
    name: "Paket Transformation",
    duration: "13 minggu",
    format: "Hybrid + Demo Day",
    participants: "Mulai 15 orang",
    fit: "Organisasi yang siap menjalankan use case prioritas",
    output: "Workflow map · SOP · Champion plan · 30-day roadmap · Demo Day",
    recommended: true,
  },
  {
    id: "custom",
    name: "Custom Track",
    duration: "Disesuaikan",
    format: "Custom",
    participants: "Mulai 15 orang",
    fit: "Kebutuhan lintas fungsi atau track developer",
    output: "Custom roadmap · Role-based curriculum · Adoption plan",
    recommended: false,
  },
] as const;

export type Program = (typeof programs)[number];

// Short cards right under the hero; the full comparison lives in the programs table.
export const programOverview = [
  {
    name: "Paket Foundation",
    duration: "1 hari",
    format: "Offline",
    description: "Samakan dasar AI seluruh tim dalam satu hari workshop.",
    includes: null,
    takeaways: [
      "Paham dasar AI & cara pakainya",
      "Kumpulan prompt siap pakai",
      "Daftar ide AI untuk kerjaan tim",
    ],
    recommended: false,
  },
  {
    name: "Paket Acceleration",
    duration: "2 hari",
    format: "Hybrid",
    description:
      "Praktik langsung sesuai peran, sampai AI masuk ke workflow harian tiap divisi.",
    includes: null,
    takeaways: [
      "Latihan langsung dengan kerjaan sehari-hari",
      "Prompt siap pakai untuk tiap role",
      "Rencana langkah setelah training",
    ],
    recommended: false,
  },
  {
    name: "Paket Transformation",
    duration: "13 minggu",
    format: "Hybrid",
    description:
      "Workshop dan pendampingan sampai AI dipakai tiap minggu, dengan ROI yang terukur untuk perusahaan.",
    includes: "Semua isi Paket Foundation & Acceleration, plus:",
    takeaways: [
      "Didampingi trainer tiap minggu sampai jadi kebiasaan",
      "LMS interaktif untuk belajar & latihan kapan saja",
      "Showcase hasil training tim di akhir program",
    ],
    recommended: true,
  },
] as const;

export const curriculumModules = [
  {
    title: "AI Baseline & Safe Use",
    copy: "Memahami peluang, batasan, dan prinsip penggunaan AI yang bertanggung jawab.",
    kicker: "Fondasi bersama",
    lead: "Samakan cara kerja AI sebelum tim mulai bereksperimen.",
    points: [
      "Cara kerja AI dan batas penggunaannya",
      "Keamanan data dan prinsip penggunaan yang aman",
      "Standar prompt awal untuk seluruh tim",
    ],
    result: "Baseline & guardrails tim",
  },
  {
    title: "Prompting & Context",
    copy: "Menyusun instruksi yang jelas dengan konteks kerja yang cukup.",
    kicker: "Instruksi yang jelas",
    lead: "Ubah kebutuhan kerja menjadi instruksi yang menghasilkan output lebih konsisten.",
    points: [
      "Struktur prompt yang mudah diulang",
      "Konteks, format, dan contoh yang relevan",
      "Prompt starter untuk workflow prioritas",
    ],
    result: "Prompt starter kit",
  },
  {
    title: "Workflow Design",
    copy: "Memetakan pekerjaan berulang dan memilih bagian yang layak dibantu AI.",
    kicker: "Pemetaan workflow",
    lead: "Temukan titik kerja yang paling masuk akal untuk dibantu AI.",
    points: [
      "Peta alur kerja dan pekerjaan berulang",
      "Shortlist use case yang relevan",
      "Batas antara judgment manusia dan bantuan AI",
    ],
    result: "Workflow map & use-case shortlist",
  },
  {
    title: "Role-based Lab",
    copy: "Menguji workflow pada contoh nyata dari fungsi yang ikut program.",
    kicker: "Praktik per role",
    lead: "Latihan langsung menggunakan konteks dan contoh kerja tiap fungsi.",
    points: [
      "Studi kasus sesuai tanggung jawab role",
      "Praktik menggunakan tools AI yang relevan",
      "Feedback untuk memperbaiki workflow",
    ],
    result: "Contoh workflow per divisi",
  },
  {
    title: "Quality & Review",
    copy: "Memeriksa output, menjaga judgment, dan membuat standar kerja sederhana.",
    kicker: "Standar kualitas",
    lead: "Pastikan output AI tetap akurat, relevan, dan siap digunakan.",
    points: [
      "Checklist review untuk kualitas dan fakta",
      "Cara menjaga judgment manusia",
      "Standar output yang bisa dipakai bersama",
    ],
    result: "Quality checklist & review standard",
  },
  {
    title: "Adoption Plan",
    copy: "Menentukan owner, ritme follow-up, dan langkah implementasi berikutnya.",
    kicker: "Langkah adopsi",
    lead: "Tutup program dengan langkah nyata agar penggunaan AI terus bergerak.",
    points: [
      "Owner dan workflow prioritas",
      "Ritme follow-up dan coaching",
      "Langkah implementasi 30 hari",
    ],
    result: "Adoption plan 30 hari",
  },
];

export const faqs = [
  {
    question: "Program mana yang paling tepat untuk organisasi kami?",
    answer:
      "Paket Foundation menyamakan baseline. Paket Acceleration membawa AI ke satu fungsi. Paket Transformation membantu tim menjalankan satu use case prioritas. Kebutuhan lintas fungsi bisa dimulai dari Custom AI Adoption Program.",
  },
  {
    question: "Apakah kami harus sudah punya use case AI?",
    answer:
      "Tidak. Kita bisa mulai dari pekerjaan yang berulang, hambatan yang terasa, dan peluang yang paling masuk akal untuk diuji bersama.",
  },
  {
    question: "Siapa yang sebaiknya ikut?",
    answer:
      "Libatkan orang yang dekat dengan pekerjaan sehari-hari, manager yang dapat memberi coaching, dan sponsor yang membantu menjaga tindak lanjut.",
  },
  {
    question: "Apa yang dibawa pulang setelah program?",
    answer:
      "Tim membawa workflow, contoh kerja, use-case shortlist, owner, dan langkah berikutnya sesuai format program yang dipilih.",
  },
  {
    question: "Bagaimana memastikan adoption berlanjut setelah training?",
    answer:
      "Setiap program ditutup dengan praktik, artifact, dan next step yang jelas. Scope yang lebih besar dapat ditambah coaching dan progress visibility.",
  },
  {
    question: "Apakah program bisa disesuaikan untuk tim developer?",
    answer:
      "Bisa. Contoh kerja, tools, cohort, dan kedalaman teknis dapat dibuat khusus untuk engineering team atau fungsi tertentu.",
  },
];

// Placeholder people and numbers for the hero wall; swap for real, consented alumni before relying on it.
const portrait = (gender: "men" | "women", n: number) =>
  `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

export const heroPeople = [
  { name: "Rina Maharani", role: "Finance Manager", photo: portrait("women", 44), productivity: 42, aiUsage: 86 },
  { name: "Bima Prasetyo", role: "Sales Executive", photo: portrait("men", 32), productivity: 35, aiUsage: 78 },
  { name: "Ayu Lestari", role: "HR Business Partner", photo: portrait("women", 65), productivity: 31, aiUsage: 74 },
  { name: "Dimas Saputra", role: "Head of Operations", photo: portrait("men", 75), productivity: 48, aiUsage: 91 },
  { name: "Putri Anggraini", role: "Marketing Specialist", photo: portrait("women", 68), productivity: 56, aiUsage: 88 },
  { name: "Reza Firmansyah", role: "Procurement Officer", photo: portrait("men", 46), productivity: 39, aiUsage: 72 },
  { name: "Nabila Rahma", role: "Legal Counsel", photo: portrait("women", 17), productivity: 28, aiUsage: 69 },
  { name: "Fajar Nugroho", role: "Software Engineer", photo: portrait("men", 22), productivity: 61, aiUsage: 94 },
  { name: "Sekar Wulandari", role: "Customer Service Lead", photo: portrait("women", 79), productivity: 44, aiUsage: 83 },
  { name: "Arief Hidayat", role: "VP of Sales", photo: portrait("men", 52), productivity: 37, aiUsage: 80 },
  { name: "Dewi Kartika", role: "Finance Analyst", photo: portrait("women", 29), productivity: 46, aiUsage: 85 },
  { name: "Yoga Pratama", role: "Data Analyst", photo: portrait("men", 61), productivity: 52, aiUsage: 90 },
] as const;

export type HeroPerson = (typeof heroPeople)[number];

// Hero visual, picked by ?display=<key>; anything else keeps the tube scene.
const HERO_DISPLAYS = ["tube", "proof-productivity", "mentor"] as const;

export type HeroDisplay = (typeof HERO_DISPLAYS)[number];

export function resolveHeroDisplay(value: string | string[] | undefined): HeroDisplay {
  const key = (Array.isArray(value) ? value[0] : value)?.trim().toLowerCase();
  return HERO_DISPLAYS.find((display) => display === key) ?? "tube";
}

// Hero copy per decision-maker, picked by ?audience=<key> on ad/outreach links; unknown keys fall back to default.
export const heroVariants = {
  default: {
    headline: "Corporate Training AI untuk tim yang lebih produktif",
    subheadline:
      "Pelatihan AI praktis sesuai kebutuhan tiap divisi, dari workshop sampai pendampingan. Progress dan hasil belajar tim terukur lewat LMS.",
  },
  ceo: {
    headline: "Kompetitormu Sudah Pakai AI. Timmu?",
    subheadline:
      "Kami bangun kapabilitas AI timmu sampai dampaknya terlihat di angka bisnis, bukan cuma di sertifikat pelatihan.",
  },
  hr: {
    headline: "Training AI yang Benar-Benar Dipakai Tim",
    subheadline:
      "Program per divisi, progres tiap peserta terpantau di LMS, dan hasilnya siap kamu laporkan ke leadership.",
  },
  operations: {
    headline: "Kerja Lebih Cepat Tanpa Tambah Orang",
    subheadline:
      "Kami latih tim operasional memakai AI untuk memangkas pekerjaan berulang, dengan use case dari proses kerjamu sendiri.",
  },
  sales: {
    headline: "Riset Prospek Lebih Cepat, Follow-up Lebih Tajam",
    subheadline:
      "Kami dampingi tim sales memakai AI di setiap tahap pipeline, dari riset akun sampai proposal.",
  },
  marketing: {
    headline: "Konten Lebih Banyak, Suara Brand Tetap Terjaga",
    subheadline:
      "Kami dampingi tim marketing memakai AI untuk riset, ide kampanye, dan produksi konten yang tetap on-brand.",
  },
  it: {
    headline: "Adopsi AI yang Aman dan Terarah",
    subheadline:
      "Kami bantu tim IT dan engineering memakai AI assistant dan agent dengan workflow dan guardrail yang siap untuk perusahaan.",
  },
} as const;

export type HeroAudience = keyof typeof heroVariants;

export function resolveHeroAudience(
  value: string | string[] | undefined
): HeroAudience {
  const key = (Array.isArray(value) ? value[0] : value)?.trim().toLowerCase();
  return key && Object.hasOwn(heroVariants, key)
    ? (key as HeroAudience)
    : "default";
}
