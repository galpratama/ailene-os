// Shared by the rendered sections and the JSON-LD, so the two can't drift apart.

export const programs = [
  {
    id: "foundation",
    name: "Work Foundation",
    duration: "1 hari",
    format: "Full offline",
    participants: "Mulai 15 orang",
    fit: "Tim yang baru mulai memakai AI",
    output: "Prompt library starter · Workflow examples · Use-case shortlist",
    recommended: false,
  },
  {
    id: "intensive",
    name: "Productivity Intensive",
    duration: "2 hari",
    format: "Offline atau hybrid",
    participants: "Mulai 15 orang",
    fit: "Tim yang ingin menerapkan workflow sesuai fungsi",
    output:
      "Use-case map · Prompt library per role · Implementation action plan",
    recommended: false,
  },
  {
    id: "sprint",
    name: "Transformation Sprint",
    duration: "13 week",
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
      "Foundation menyamakan baseline. Intensive membawa AI ke satu fungsi. Sprint membantu tim menjalankan satu use case prioritas. Kebutuhan lintas fungsi bisa dimulai dari Custom AI Adoption Program.",
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
