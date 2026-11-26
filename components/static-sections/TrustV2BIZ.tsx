import { V2_H2, V2_LEAD, V2_SECTION, V2_TEXT_LINK, V2_WRAP } from "@/lib/biz-home-v2";
import Image from "next/image";

const pillars: { title: string; points: string[]; link?: [string, string] }[] = [
  {
    title: "Metode",
    points: ["Setiap karyawan dinilai dengan CFTE AI Proficiency Framework", "Hasil diukur di empat level Kirkpatrick, sampai jam yang dihemat"],
  },
  {
    title: "Tata kelola",
    points: [
      "Kebijakan penggunaan AI selaras UU PDP",
      "Bekerja dengan AI yang sudah Anda bayar",
      "Data disamarkan di setiap lab",
      "NDA dan DPA ditandatangani sebelum hari pertama",
    ],
    link: ["Keamanan data", "/governance"],
  },
  {
    title: "Orang",
    points: ["Galih Pratama, Lead Trainer", "Adythia Pratama, AI for Marketing & Growth", "Spesialis per industri dan fungsi", "Strategy & leadership by Raymond Chin"],
  },
];

export default function TrustV2BIZ() {
  return (
    <section id="klien" aria-labelledby="v2-trust" className={`${V2_SECTION} bg-v2-paper`}>
      <div className={V2_WRAP}>
        <div className="max-w-190">
          <h2 id="v2-trust" className={V2_H2}>
            Dipercaya perusahaan terkemuka Indonesia.
          </h2>
          <p className={`${V2_LEAD} mt-5`}>Sesi kepemimpinan dan tenaga kerja untuk perusahaan multinasional, perusahaan terbuka, dan BUMN.</p>
        </div>
        <figure className="mt-[clamp(24px,3vw,36px)] rounded-2xl border border-v2-rule bg-white px-[clamp(16px,3vw,40px)] py-[clamp(16px,2.4vw,28px)]">
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
            <div className="biz-marquee flex w-max [animation:biz-marquee_42s_linear_infinite] hover:[animation-play-state:paused] motion-reduce:hidden">
              <Image
                src="/biz/v2/clients-strip.webp"
                width={1600}
                height={140}
                loading="lazy"
                alt="Pertamina, Bank Indonesia, Hypernet (an XLSMART company), Prudential"
                className="h-auto w-250 shrink-0 sm:w-300 lg:w-350"
              />
              <Image
                src="/biz/v2/clients-strip.webp"
                width={1600}
                height={140}
                loading="lazy"
                alt=""
                aria-hidden="true"
                className="h-auto w-250 shrink-0 sm:w-300 lg:w-350"
              />
            </div>
            <Image
              src="/biz/v2/clients-strip.webp"
              width={1600}
              height={140}
              loading="lazy"
              alt="Pertamina, Bank Indonesia, Hypernet (an XLSMART company), Prudential"
              className="hidden h-auto w-full motion-reduce:block"
            />
          </div>
          <figcaption className="mt-3 text-[0.82rem] text-v2-ink-3">Beberapa klien dianonimkan atas permintaan mereka.</figcaption>
        </figure>
        <div className="mt-[clamp(40px,5vw,64px)] grid gap-[clamp(24px,3vw,40px)] min-[860px]:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="border-t-2 border-v2-ink pt-5">
              <h3 className="font-jakarta text-[1.45rem] font-extrabold tracking-[-0.025em]">{pillar.title}</h3>
              <ul className="mt-3.5 text-[0.96rem] text-v2-ink-2">
                {pillar.points.map((point) => (
                  <li key={point} className="border-b border-v2-rule py-2.25">
                    {point}
                  </li>
                ))}
              </ul>
              {pillar.link && (
                <a href={pillar.link[1]} className={`${V2_TEXT_LINK} mt-4 inline-block`}>
                  {pillar.link[0]}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
