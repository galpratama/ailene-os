import AppButton from "@/components/buttons/AppButton";
import { AcademyAssessmentMockV2BIZ } from "@/components/elements/AcademyMocksV2BIZ";
import ShellV2BIZ from "@/components/elements/ShellV2BIZ";
import LmsHeroVisualV2BIZ from "@/components/heroes/LmsHeroVisualV2BIZ";
import PageHeroV2BIZ from "@/components/heroes/PageHeroV2BIZ";
import RevealOnScroll from "@/components/motion/RevealOnScroll";
import LeadFormV2BIZ from "@/components/static-sections/LeadFormV2BIZ";
import { V2_BODY, V2_FORM_ANCHOR, V2_H2, V2_H3, V2_LEAD, V2_SECTION, V2_WRAP } from "@/lib/biz-home-v2";
import { IconBrandWhatsapp } from "@tabler/icons-react";

const tracked = [
  ["Band dan level", "Band 1 sampai 5, tingkat kemampuan AI dari baru mengenal sampai memimpin perubahan. Level 1 sampai 3 di jalur belajar."],
  [
    "Tiga dimensi, enam pilar",
    "Pengetahuan, keterampilan, dan kebiasaan. AI Foundation, Tool Fluency, AI Habit, Prompting Quality, Use Case Diversity, Agentic Capabilities, skor 0–5.",
  ],
  ["Kebiasaan mingguan", "Siapa yang memakai AI setiap minggu, di alat yang disetujui perusahaan."],
  ["Tugas praktik per chapter", "Latihan pada pekerjaan peserta sendiri, dengan pre-test dan post-test di setiap chapter."],
  ["Use case terverifikasi", "Sebelum dan sesudah, alat, bukti kerja, dan champion yang memeriksa. Jamnya baru dihitung setelah diverifikasi."],
  ["XP dan leaderboard", "Dari use case, prompt, dan latihan. Per departemen, kohort, dan tim."],
  [
    "Tampilan Direksi",
    "Terlatih, aktif mingguan, Ailene Score, use case, dan jam per divisi. Status Sesuai target, Perlu pendampingan, atau Berisiko. Ekspor PDF.",
  ],
];

const cfteLevels = ["L1 AI Literacy", "L2 Applied AI Practitioner", "L3 Systems & Decision Leader"];

export default function LmsPageV2BIZ() {
  return (
    <ShellV2BIZ page="lms">
      <PageHeroV2BIZ
        id="v2-academy-hero"
        tone="paper-2"
        title="LMS perusahaan Anda. Pantau adopsi AI per karyawan dan per divisi."
        lead="Perusahaan Anda, dengan akademi AI sendiri. Karyawan belajar dan naik level seperti di game. Direksi melihat siapa yang benar-benar memakai AI, dan berapa jam yang dihemat."
        actions={
          <AppButton href={`#${V2_FORM_ANCHOR}`} variant="forestV2" size="cta" trackPlacement="lms">
            <IconBrandWhatsapp size={18} aria-hidden="true" />
            Minta demo di konsultasi 20 menit
          </AppButton>
        }
        aside={<LmsHeroVisualV2BIZ />}
      />
      <section aria-labelledby="v2-academy-tracked" className={`${V2_SECTION} bg-v2-paper`}>
        <RevealOnScroll className={V2_WRAP}>
          <div className="max-w-190">
            <h2 id="v2-academy-tracked" className={V2_H2}>
              Yang dilacak, untuk setiap karyawan.
            </h2>
            <p className={`${V2_LEAD} mt-5`}>Logo Anda. Kurikulum Anda. Semua data AI Anda di satu tempat.</p>
          </div>
          <ol className="mt-[clamp(36px,5vw,56px)] border-t border-v2-rule">
            {tracked.map(([title, body]) => (
              <li key={title} className="grid gap-1 border-b border-v2-rule py-5.5 min-[700px]:grid-cols-[4fr_7fr] min-[700px]:gap-5">
                <b className="font-jakarta text-[1.15rem] tracking-[-0.02em]">{title}</b>
                <span className="text-v2-ink-2">{body}</span>
              </li>
            ))}
          </ol>
        </RevealOnScroll>
      </section>
      <section aria-labelledby="v2-academy-measured" className={`${V2_SECTION} bg-v2-paper-2`}>
        <RevealOnScroll className={`${V2_WRAP} grid items-center gap-[clamp(32px,5vw,72px)] min-[900px]:grid-cols-2`}>
          <div>
            <h2 id="v2-academy-measured" className={V2_H3}>
              Setiap karyawan diukur. Bukan diperkirakan.
            </h2>
            <p className={`${V2_BODY} mt-3`}>
              Kami menilai setiap karyawan dengan CFTE AI Proficiency Framework, standar terbuka untuk tenaga kerja profesional. Yang dinilai
              pengetahuan, keterampilan, dan perilaku di pekerjaan nyata, bukan penguasaan satu alat. Jadi skornya tetap berlaku saat alatnya
              berganti.
            </p>
            <ul aria-label="Tiga level CFTE" className="mt-5 flex flex-wrap gap-1.5">
              {cfteLevels.map((level, index) => (
                <li
                  key={level}
                  className={`rounded-md px-2.5 py-1.5 text-[0.78rem] font-bold ${
                    index === cfteLevels.length - 1 ? "bg-v2-forest text-v2-on-forest" : "bg-v2-paper-3"
                  }`}
                >
                  {level}
                </li>
              ))}
            </ul>
          </div>
          <AcademyAssessmentMockV2BIZ />
        </RevealOnScroll>
      </section>
      <section aria-labelledby="v2-academy-tools" className="bg-v2-paper py-[clamp(56px,7vw,96px)]">
        <div className={`${V2_WRAP} grid items-center gap-[clamp(32px,5vw,72px)] min-[900px]:grid-cols-2`}>
          <div>
            <h2 id="v2-academy-tools" className={V2_H3}>
              Bekerja dengan AI yang sudah Anda bayar.
            </h2>
            <p className={`${V2_BODY} mt-3`}>
              Copilot, Gemini, ChatGPT, atau Claude. LMS ini mengukur pemakaian dan hasilnya, apa pun alat yang dipilih perusahaan Anda.
            </p>
          </div>
          <div>
            <AppButton href="/governance" variant="outlineV2" size="cta">
              Lihat kebijakan data kami
            </AppButton>
          </div>
        </div>
      </section>
      <LeadFormV2BIZ />
    </ShellV2BIZ>
  );
}
