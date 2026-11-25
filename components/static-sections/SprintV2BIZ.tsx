import { V2_H2, V2_LEAD, V2_SECTION, V2_TEXT_LINK, V2_WRAP } from "@/lib/biz-home-v2";
import { SprintPhaseListV2BIZ, SprintWeeksV2BIZ } from "@/components/elements/SprintTimelineV2BIZ";
import Image from "next/image";

const phases = [
  { weeks: "Minggu 1–2", title: "Ukur kondisi awal & sepakati target", body: "Kami ukur kesiapan setiap orang. Pimpinan menyepakati targetnya." },
  {
    weeks: "Minggu 3–9",
    title: "Praktik di pekerjaan nyata",
    body: "Delapan lab, yaitu sesi praktik memakai AI pada pekerjaan peserta sendiri. Satu champion untuk setiap 15 orang. Use case dikirim dan diverifikasi.",
  },
  { weeks: "Minggu 10", title: "Demo Day", body: "Tim mempresentasikan hasilnya ke Direksi. Kesiapan diukur ulang." },
];

export default function SprintV2BIZ() {
  return (
    <section id="sprint" aria-labelledby="v2-sprint" className={`${V2_SECTION} bg-v2-paper`}>
      <div className={`${V2_WRAP} grid items-start gap-[clamp(32px,5vw,72px)] min-[900px]:grid-cols-[7fr_5fr]`}>
        <div>
          <h2 id="v2-sprint" className={V2_H2}>
            10 minggu. Ditutup dengan angka.
          </h2>
          <p className={`${V2_LEAD} mt-5`}>
            Transformation Sprint adalah program yang kami rekomendasikan. Waktu terbatas? Mulai dari workshop 1 atau 2 hari.
          </p>
          <SprintWeeksV2BIZ className="mt-9" />
          <SprintPhaseListV2BIZ phases={phases} className="mt-10" />
          <p className="mt-7">
            <a href="/sprint" className={V2_TEXT_LINK}>
              Lihat jadwal lengkap Sprint
            </a>
          </p>
        </div>
        <figure className="min-[900px]:sticky min-[900px]:top-25">
          <div className="aspect-4/3 overflow-hidden rounded-2xl bg-v2-paper-3">
            <Image
              src="/biz/v2/demoday-winners.webp"
              width={760}
              height={570}
              loading="lazy"
              alt="Pemenang Demo Day berdiri di panggung memegang penghargaan"
              className="size-full object-cover"
            />
          </div>
          <figcaption className="mt-2.5 text-[0.84rem] text-v2-ink-3">
            Demo Day, minggu 10: tim mempresentasikan hasil di depan Direksi, dan tim terbaik menerima penghargaan.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
