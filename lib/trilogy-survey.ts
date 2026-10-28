// Biz /trilogy-survey questions and answer checks; the proficiency answer key stays server-side in `apis/trilogy-survey.ts`.

export const TRILOGY_SURVEY_TITLE = "Survei Penggunaan & Kemampuan AI";
export const TRILOGY_SURVEY_TEXT_MAX = 1500;
export const TRILOGY_SURVEY_IDENTITY_MAX = 120;

export type TrilogySurveyOption = {
  value: string;
  label: string;
  // Picking it clears every other choice (e.g. "Belum pernah pakai").
  exclusive?: boolean;
  // Picking it asks for a short free-text detail.
  other?: boolean;
};

type QuestionBase = {
  id: string;
  title: string;
  hint?: string;
  optional?: boolean;
};

export type TrilogySurveyQuestion =
  | (QuestionBase & {
      type: "single" | "multi";
      options: TrilogySurveyOption[];
    })
  | (QuestionBase & { type: "scale"; minLabel: string; maxLabel: string })
  | (QuestionBase & { type: "text"; placeholder?: string; rows?: number });

// Single and scale answers keep one entry in `choices`; `text` holds an essay or an "other" detail.
export type TrilogySurveyAnswer = { choices: string[]; text: string };
export type TrilogySurveyAnswers = Record<string, TrilogySurveyAnswer>;

export type TrilogySurveyIdentity = {
  name: string;
  email: string;
  job_title: string;
};

export const TRILOGY_SURVEY_SCALE = ["1", "2", "3", "4", "5"];

export const TRILOGY_SURVEY_QUESTIONS: TrilogySurveyQuestion[] = [
  {
    id: "tools",
    type: "multi",
    title: "Tools AI apa saja yang kamu pakai dalam sebulan terakhir?",
    hint: "Pilih semua yang sesuai.",
    options: [
      { value: "chatgpt", label: "ChatGPT" },
      { value: "gemini", label: "Google Gemini" },
      { value: "claude", label: "Claude" },
      { value: "copilot", label: "Microsoft Copilot" },
      { value: "perplexity", label: "Perplexity" },
      { value: "meta_ai", label: "Meta AI (WhatsApp / Instagram)" },
      { value: "notion_ai", label: "Notion AI" },
      { value: "canva_ai", label: "Canva AI" },
      { value: "coding", label: "GitHub Copilot / Cursor / tools coding" },
      { value: "other", label: "Lainnya", other: true },
      { value: "none", label: "Belum pernah pakai AI", exclusive: true },
    ],
  },
  {
    id: "frequency",
    type: "single",
    title: "Seberapa sering kamu pakai AI untuk pekerjaan?",
    options: [
      { value: "never", label: "Tidak pernah" },
      { value: "monthly", label: "Beberapa kali sebulan" },
      { value: "weekly", label: "Beberapa kali seminggu" },
      { value: "daily", label: "Hampir setiap hari" },
      { value: "many_daily", label: "Berkali-kali setiap hari" },
    ],
  },
  {
    id: "use_cases",
    type: "multi",
    title: "Sehari-hari, biasanya kamu pakai AI untuk apa?",
    hint: "Pilih semua yang sesuai.",
    options: [
      { value: "writing", label: "Menulis atau menyunting email & dokumen" },
      { value: "summarizing", label: "Merangkum dokumen, artikel, atau rapat" },
      { value: "research", label: "Riset dan mencari informasi" },
      { value: "brainstorm", label: "Brainstorming ide" },
      { value: "data", label: "Analisis data atau spreadsheet" },
      { value: "presentation", label: "Menyusun presentasi" },
      { value: "translation", label: "Terjemahan" },
      { value: "visual", label: "Membuat gambar, desain, atau video" },
      { value: "coding", label: "Coding atau automasi" },
      { value: "learning", label: "Belajar topik baru" },
      { value: "other", label: "Lainnya", other: true },
      { value: "none", label: "Belum pakai AI untuk kerja", exclusive: true },
    ],
  },
  {
    id: "recent_example",
    type: "text",
    title:
      "Ceritakan satu contoh terakhir kamu pakai AI untuk kerja. Apa tugasnya, dan bagaimana hasilnya?",
    hint: "Boleh dilewati kalau belum pernah.",
    placeholder:
      "Contoh: Saya minta ChatGPT merangkum notulen rapat jadi daftar action item. Hasilnya 80% bisa langsung dipakai.",
    optional: true,
  },
  {
    id: "access",
    type: "single",
    title: "Akses AI seperti apa yang kamu punya saat ini?",
    options: [
      { value: "none", label: "Belum punya akses" },
      { value: "free", label: "Versi gratis saja" },
      { value: "paid_personal", label: "Berbayar, dibayar sendiri" },
      { value: "company", label: "Disediakan kantor" },
    ],
  },
  {
    id: "self_level",
    type: "single",
    title: "Mana yang paling menggambarkan cara kamu memakai AI sekarang?",
    options: [
      { value: "l0", label: "Belum pernah memakai AI" },
      {
        value: "l1",
        label: "Sesekali tanya-jawab sederhana, seperti pakai mesin pencari",
      },
      {
        value: "l2",
        label:
          "Rutin untuk tugas harian, dengan prompt yang memberi konteks dan format",
      },
      {
        value: "l3",
        label:
          "Punya alur kerja berulang (custom GPT, Projects, template prompt)",
      },
      {
        value: "l4",
        label: "Membangun automasi atau AI agent yang dipakai tim",
      },
    ],
  },
  {
    id: "confidence",
    type: "scale",
    title: "Seberapa percaya diri kamu memakai AI untuk pekerjaan?",
    minLabel: "Belum percaya diri",
    maxLabel: "Sangat percaya diri",
  },
  {
    id: "refine_output",
    type: "single",
    title:
      "Hasil jawaban AI belum sesuai harapanmu. Apa langkah paling efektif berikutnya?",
    options: [
      { value: "manual", label: "Berhenti dan kerjakan manual" },
      { value: "repeat", label: "Kirim ulang pertanyaan yang sama persis" },
      {
        value: "iterate",
        label:
          "Tambahkan konteks, contoh, dan format yang diinginkan, lalu minta AI memperbaiki",
      },
      { value: "switch", label: "Langsung pindah ke tools AI lain" },
    ],
  },
  {
    id: "best_prompt",
    type: "single",
    title:
      "Kamu perlu meringkas laporan penjualan untuk direksi. Prompt mana yang paling baik?",
    options: [
      { value: "a", label: "“Buatkan ringkasan laporan ini.”" },
      {
        value: "b",
        label: "“Tolong ringkas laporan ini sesingkat mungkin tapi lengkap ya.”",
      },
      { value: "c", label: "“Ringkasan laporan Q3, poin-poin, yang bagus.”" },
      {
        value: "d",
        label:
          "“Kamu analis bisnis. Ringkas laporan penjualan Q3 terlampir jadi 5 poin untuk direksi: tren utama, risiko, dan satu rekomendasi. Bahasa formal, maksimal 150 kata.”",
      },
    ],
  },
  {
    id: "verify_facts",
    type: "single",
    title:
      "AI memberimu angka statistik dan kutipan untuk dimasukkan ke laporan. Apa yang sebaiknya kamu lakukan?",
    options: [
      {
        value: "verify",
        label: "Cek ke sumber aslinya sebelum dipakai",
      },
      { value: "trust", label: "Langsung pakai, AI sudah sangat akurat" },
      {
        value: "ask_again",
        label: "Tanya AI yang sama apakah datanya benar, lalu pakai",
      },
      { value: "round", label: "Pakai, tapi bulatkan angkanya supaya aman" },
    ],
  },
  {
    id: "data_safety",
    type: "single",
    title:
      "Data mana yang paling aman dimasukkan ke tools AI publik versi gratis?",
    options: [
      { value: "salary", label: "Data gaji karyawan untuk dianalisis" },
      { value: "customer", label: "Daftar nama dan nomor HP pelanggan" },
      {
        value: "public",
        label: "Siaran pers yang sudah terbit di website perusahaan",
      },
      { value: "contract", label: "Draf kontrak kerja sama yang masih rahasia" },
    ],
  },
  {
    id: "hallucination",
    type: "single",
    title: "Dalam konteks AI, apa yang dimaksud dengan “halusinasi”?",
    options: [
      { value: "slow", label: "AI merespons sangat lambat atau macet" },
      {
        value: "fabricate",
        label:
          "AI menghasilkan informasi yang terdengar meyakinkan tapi salah atau tidak ada dasarnya",
      },
      { value: "refuse", label: "AI menolak menjawab pertanyaan" },
      { value: "image", label: "AI membuat gambar yang tidak realistis" },
    ],
  },
  {
    id: "prompt_practice",
    type: "text",
    title:
      "Latihan singkat: tulis prompt yang akan kamu kirim ke AI untuk membuat draf email follow-up ke klien setelah meeting.",
    hint: "Tulis persis seperti yang akan kamu ketik ke AI. Tidak ada jawaban benar atau salah.",
    placeholder: "Tulis prompt-mu di sini...",
    rows: 7,
  },
  {
    id: "barriers",
    type: "multi",
    title: "Apa hambatan terbesarmu dalam memakai AI untuk pekerjaan?",
    hint: "Pilih semua yang sesuai.",
    options: [
      { value: "where_to_start", label: "Tidak tahu harus mulai dari mana" },
      { value: "prompting", label: "Sulit menulis prompt yang tepat" },
      { value: "accuracy", label: "Hasilnya sering kurang akurat" },
      { value: "data_security", label: "Khawatir soal keamanan data" },
      { value: "access", label: "Tidak ada akses atau izin dari kantor" },
      { value: "time", label: "Tidak ada waktu untuk belajar" },
      { value: "other", label: "Lainnya", other: true },
      { value: "none", label: "Tidak ada hambatan berarti", exclusive: true },
    ],
  },
  {
    id: "goal",
    type: "text",
    title:
      "Setelah program ini, pekerjaan apa yang paling ingin kamu bantu dengan AI?",
    hint: "Boleh dilewati.",
    placeholder: "Contoh: Membuat laporan mingguan tim lebih cepat.",
    optional: true,
  },
];

export const EMPTY_TRILOGY_ANSWER: TrilogySurveyAnswer = {
  choices: [],
  text: "",
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// The text detail is required only when the picked choice asks for one.
function needsOtherText(
  question: TrilogySurveyQuestion,
  answer: TrilogySurveyAnswer,
): boolean {
  if (question.type !== "single" && question.type !== "multi") return false;
  return question.options.some(
    (option) => option.other && answer.choices.includes(option.value),
  );
}

export function isTrilogyAnswerComplete(
  question: TrilogySurveyQuestion,
  answer: TrilogySurveyAnswer | undefined,
): boolean {
  const value = answer ?? EMPTY_TRILOGY_ANSWER;
  if (question.type === "text") {
    return question.optional === true || value.text.trim().length > 0;
  }
  if (value.choices.length === 0) return question.optional === true;
  if (needsOtherText(question, value)) return value.text.trim().length > 0;
  return true;
}

function allowedChoices(question: TrilogySurveyQuestion): string[] {
  if (question.type === "scale") return TRILOGY_SURVEY_SCALE;
  if (question.type === "text") return [];
  return question.options.map((option) => option.value);
}

// Drops unknown questions and options from a restored draft or a request body.
export function normalizeTrilogyAnswers(raw: unknown): TrilogySurveyAnswers {
  const input =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const answers: TrilogySurveyAnswers = {};

  for (const question of TRILOGY_SURVEY_QUESTIONS) {
    const entry = input[question.id] as
      | { choices?: unknown; text?: unknown }
      | undefined;
    const allowed = allowedChoices(question);
    const rawChoices = entry?.choices;
    let choices = Array.isArray(rawChoices)
      ? [
          ...new Set(
            rawChoices.filter(
              (c): c is string => typeof c === "string" && allowed.includes(c),
            ),
          ),
        ]
      : [];
    if (question.type === "multi") {
      const exclusive = question.options.find(
        (option) => option.exclusive && choices.includes(option.value),
      );
      if (exclusive) choices = [exclusive.value];
    } else {
      choices = choices.slice(0, 1);
    }
    const text = typeof entry?.text === "string" ? entry.text : "";
    answers[question.id] = {
      choices,
      text: text.slice(0, TRILOGY_SURVEY_TEXT_MAX),
    };
  }
  return answers;
}

// Human-readable cell value for the spreadsheet.
export function formatTrilogyAnswer(
  question: TrilogySurveyQuestion,
  answer: TrilogySurveyAnswer | undefined,
): string {
  const value = answer ?? EMPTY_TRILOGY_ANSWER;
  if (question.type === "text") return value.text.trim();
  if (question.type === "scale") return value.choices[0] ?? "";
  return question.options
    .filter((option) => value.choices.includes(option.value))
    .map((option) =>
      option.other && value.text.trim()
        ? `${option.label}: ${value.text.trim()}`
        : option.label,
    )
    .join(", ");
}
