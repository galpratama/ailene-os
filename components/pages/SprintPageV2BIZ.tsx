import AppButton from "@/components/buttons/AppButton";
import ShellV2BIZ from "@/components/elements/ShellV2BIZ";
import { SprintPhaseListV2BIZ, SprintWeeksV2BIZ } from "@/components/elements/SprintTimelineV2BIZ";
import PageHeroV2BIZ from "@/components/heroes/PageHeroV2BIZ";
import RevealOnScroll from "@/components/motion/RevealOnScroll";
import LeadFormV2BIZ from "@/components/static-sections/LeadFormV2BIZ";
import { V2_FORM_ANCHOR, V2_H2, V2_SECTION, V2_TEXT_LINK, V2_WRAP } from "@/lib/biz-home-v2";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import Image from "next/image";

const phases = [
  {
    weeks: "Minggu 1–2",
    title: "Ukur kondisi awal & sepakati target",
    body: "Assessment kesiapan untuk setiap peserta. Sesi Direksi untuk menyepakati target per divisi. Champion dipilih: karyawan internal yang membimbing rekan di divisinya, satu untuk setiap 15 orang.",
  },
  {
    weeks: "Minggu 3–9",
    title: "Praktik di pekerjaan nyata",
    body: "Delapan lab, yaitu sesi praktik memakai AI pada pekerjaan nyata setiap divisi. Peserta mengirim use case ke AI Academy. Champion memverifikasi sebelum jamnya dihitung.",
  },
  {
    weeks: "Minggu 10",
    title: "Demo Day",
    body: "Setiap tim mempresentasikan use case terbaiknya ke Direksi. Pemenang menerima penghargaan. Kesiapan diukur ulang dan masuk Rapor AI pertama.",
  },
];

const outputs = [
  { title: "Skor sebelum dan sesudah", body: "Untuk setiap peserta: band, tiga dimensi, dan enam pilar kompetensi." },
  { title: "Use case terverifikasi", body: "Lengkap dengan bukti dan nama champion yang memeriksa." },
  { title: "Jam dihemat per bulan", body: "Per divisi, siap dibawa ke rapat Direksi." },
  { title: "Rapor AI pertama", body: "Dan rencana kuartal berikutnya." },
];

export default function SprintPageV2BIZ() {
  return (
    <ShellV2BIZ page="sprint">
      <PageHeroV2BIZ
        id="v2-sprint-hero"
        crumb={{ href: "/#layanan-train", label: "Train", current: "Transformation Sprint" }}
        title="10 minggu. Ditutup dengan angka."
        lead="Program unggulan yang kami rekomendasikan, untuk perusahaan yang ingin perubahan cara kerja, bukan sekadar sertifikat. Mulai dari 15 peserta per kohort, yaitu kelompok peserta yang mengikuti program bersamaan. Waktu terbatas? Mulai dari workshop 1 atau 2 hari."
      />
      <section aria-labelledby="v2-sprint-timeline" className={`${V2_SECTION} bg-v2-paper pt-0`}>
        <div className={V2_WRAP}>
          <h2 id="v2-sprint-timeline" className="sr-only">
            Jadwal Sprint
          </h2>
          <SprintWeeksV2BIZ />
          <RevealOnScroll className="mt-[clamp(48px,6vw,80px)] grid items-start gap-[clamp(32px,5vw,72px)] min-[900px]:grid-cols-2">
            <SprintPhaseListV2BIZ phases={phases} />
            <figure className="min-[900px]:sticky min-[900px]:top-25">
              <div className="aspect-4/3 overflow-hidden rounded-2xl bg-v2-paper-3">
                <Image
                  src="/biz/v2/demoday-present.webp"
                  width={760}
                  height={570}
                  alt="Peserta Demo Day menyimak presentasi workflow di layar besar"
                  className="size-full object-cover"
                />
              </div>
              <figcaption className="mt-2.5 text-[0.84rem] text-v2-ink-3">Demo Day: tim mempresentasikan workflow yang mereka bangun.</figcaption>
            </figure>
          </RevealOnScroll>
        </div>
      </section>
      <section aria-labelledby="v2-sprint-outputs" className={`${V2_SECTION} border-t border-v2-rule bg-v2-paper`}>
        <RevealOnScroll className={V2_WRAP}>
          <h2 id="v2-sprint-outputs" className={`${V2_H2} max-w-190`}>
            Yang dipegang HC di minggu 10.
          </h2>
          <div className="mt-[clamp(36px,5vw,64px)] grid grid-cols-2 border-t border-v2-rule min-[760px]:grid-cols-4">
            {outputs.map((output, index) => (
              <div
                key={output.title}
                className={`pt-5 pr-4.5 ${index % 2 === 1 ? "border-l border-v2-rule pl-4.5" : ""} ${
                  index >= 2 ? "mt-4.5 border-t border-v2-rule min-[760px]:mt-0 min-[760px]:border-t-0" : ""
                } ${index === 2 ? "min-[760px]:border-l min-[760px]:pl-4.5" : ""}`}
              >
                <b className="block text-[1.1rem]">{output.title}</b>
                <p className="mt-1.5 text-[0.9rem] text-v2-ink-2">{output.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-3">
            <AppButton href={`#${V2_FORM_ANCHOR}`} variant="forestV2" size="cta" trackPlacement="programs">
              <IconBrandWhatsapp size={18} aria-hidden="true" />
              Jadwalkan konsultasi 20 menit
            </AppButton>
            {/* Plain anchor: a full load to / lets the home experiment script run. */}
            <a href="/#layanan-train" className={`${V2_TEXT_LINK} px-2`}>
              Bandingkan dengan program lain
            </a>
          </div>
        </RevealOnScroll>
      </section>
      <LeadFormV2BIZ />
    </ShellV2BIZ>
  );
}
