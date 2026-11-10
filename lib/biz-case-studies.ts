const PHOTO_DIR = "/biz/case-studies/hutama-karya";

// Draft until Hutama Karya approves publishing: production builds 404 the page and hide every link to it.
export const CASE_STUDY_PUBLISHED = process.env.NODE_ENV !== "production";
export const HUTAMA_KARYA_CASE_PATH = "/study-cases/hutama-karya";

// Figures come from the LMS performance extract of 5 Nov 2026 (chapters 1 and 2, 36 non-test students).
export const hutamaKaryaCase = {
  dataAsOf: "5 November 2026",
  logo: `${PHOTO_DIR}/logo-danantara-hk.webp`,
  logoWhite: `${PHOTO_DIR}/logo-danantara-hk-white.webp`,
  hero: {
    src: `${PHOTO_DIR}/hero-how-ai-learn.webp`,
    alt: "Raymond Chin menjelaskan cara AI belajar di depan tim Human Capital Hutama Karya pada sesi luring pertama",
  },
  facts: [
    { label: "Klien", value: "PT Hutama Karya (Persero)" },
    { label: "Divisi", value: "Human Capital, 4 bagian" },
    { label: "Peserta", value: "36 karyawan" },
    { label: "Format", value: "8 sesi · 2 luring, 6 daring" },
    { label: "Periode", value: "22 Okt – 11 Des 2026" },
    { label: "Lingkungan", value: "Microsoft Copilot · ClickUp" },
  ],
  headline: [
    { value: "+11,5", unit: "poin", label: "Kenaikan rata-rata skor tes sesi 1", note: "33 peserta dengan pre- dan post-test" },
    { value: "21", unit: "dari 33", label: "Peserta yang skornya naik", note: "9 tetap, 3 turun" },
    { value: "91,7", unit: "%", label: "Mengikuti post-test sesi 1", note: "33 dari 36 peserta" },
    { value: "4,78", unit: "/ 5", label: "Rata-rata survei sesi 1", note: "27 responden, 8 butir skor" },
  ],
  scoreShift: { pre: 76.97, post: 88.48, paired: 33 },
  outcomeSplit: [
    { label: "Naik", count: 21, tone: "up" },
    { label: "Tetap", count: 9, tone: "flat" },
    { label: "Turun", count: 3, tone: "down" },
  ],
  groups: [
    { name: "HC Service", change: 14.5, paired: 11 },
    { name: "HC Strategic", change: 12.9, paired: 7 },
    { name: "HC Learning Center", change: 8.8, paired: 8 },
    { name: "HC General", change: 8.6, paired: 7 },
  ],
  sessionTwo: { change: 1.5, paired: 13, pre: 89.23 },
  pillars: [
    { title: "Pelatihan", copy: "Kurikulum empat tingkat, dari Foundation sampai Capstone, dalam delapan pertemuan." },
    { title: "Platform", copy: "LMS yang tetap hidup setelah kelas: materi, tes, tugas, dan survei per sesi." },
    { title: "Bukti dampak", copy: "Jam kerja yang dihemat, dicatat per bagian dan bisa dipertanggungjawabkan ke manajemen." },
  ],
  roles: [
    { role: "Peserta", copy: "Belajar berjenjang dan mempraktikkan AI pada tugas Human Capital sendiri." },
    { role: "Champion", copy: "Penggerak di tiap bagian: memantau tim, coaching, dan menilai hasil praktik." },
    { role: "Sponsor", copy: "Manajemen melihat progres, distribusi kompetensi, dan ROI dalam satu tampilan." },
  ],
  sessions: [
    { label: "Hari 0", date: "22 Okt", focus: "Onboarding & diagnostik awal", tool: "LMS", mode: "Daring" },
    { label: "Sesi 1", date: "23 Okt", focus: "Fondasi AI & teknik prompting", tool: "Copilot", mode: "Luring", measured: true },
    { label: "Sesi 2", date: "30 Okt", focus: "Asisten kerja pertama", tool: "Copilot", mode: "Daring", measured: true },
    { label: "Sesi 3", date: "6 Nov", focus: "Workspace & dashboard kerja", tool: "ClickUp", mode: "Daring" },
    { label: "Sesi 4", date: "13 Nov", focus: "Riset terverifikasi & analisis data", tool: "Copilot", mode: "Daring" },
    { label: "Sesi 5", date: "20 Nov", focus: "MCP & koneksi data organisasi", tool: "ClickUp + Copilot", mode: "Daring" },
    { label: "Sesi 6", date: "27 Nov", focus: "Mengemas keahlian menjadi Skill", tool: "ClickUp", mode: "Daring" },
    { label: "Sesi 7", date: "4 Des", focus: "Super Agents & delegasi multilangkah", tool: "ClickUp", mode: "Daring" },
    { label: "Sesi 8", date: "11 Des", focus: "Capstone: pembuktian & showcase", tool: "ClickUp", mode: "Luring" },
  ],
  assets: [
    { level: "Level 0", name: "Foundation", output: "Prompt PULL untuk friction point sendiri + satu output siap pakai" },
    { level: "Level 1", name: "Operator Dasar", output: "Asisten Copilot, dokumen final, dashboard kerja, riset terverifikasi" },
    { level: "Level 2", name: "Operator Lanjut", output: "Koneksi data aman, Skill reusable, Super Agent terjadwal" },
    { level: "Level 3", name: "Capstone", output: "Bukti efisiensi sebelum vs sesudah + kumpulan aset terkurasi" },
  ],
  gallery: [
    {
      src: `${PHOTO_DIR}/traffic-light.webp`,
      alt: "Fasilitator membahas kerangka Traffic Light AI Data Input di depan peserta",
      caption: "Traffic Light: memilah data hijau, kuning, dan merah sebelum masuk ke AI.",
    },
    {
      src: `${PHOTO_DIR}/pull-framework.webp`,
      alt: "Slide kerangka prompting PULL ditayangkan saat peserta berlatih di laptop",
      caption: "Kerangka PULL dipraktikkan langsung pada friction point tiap peserta.",
    },
    {
      src: `${PHOTO_DIR}/copilot-context.webp`,
      alt: "Fasilitator memperkenalkan Context Building di Microsoft Copilot",
      caption: "Context building di Microsoft Copilot, jembatan ke asisten kerja di sesi 2.",
    },
    {
      src: `${PHOTO_DIR}/participant-showcase.webp`,
      alt: "Peserta Hutama Karya berdiri mempresentasikan hasil praktik di depan kelas",
      caption: "Showcase: peserta menunjukkan hasil pertama yang langsung terpakai.",
    },
  ],
  facilitators: [
    { name: "Raymond Chin", role: "Foundation & Capstone · luring", image: "/biz/photos/trainer-raymond.webp", background: "bg-biz-forest" },
    { name: "Galih Pratama", role: "Sesi Operator 2–7 · daring", image: "/biz/photos/trainer-galih.webp", background: "bg-biz-lime" },
  ],
} as const;
