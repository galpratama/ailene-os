import { V2_H2, V2_SAMPLE, V2_SECTION, V2_WRAP } from "@/lib/biz-home-v2";

const companies = [
  {
    title: "Dilatih sekali, lalu berhenti",
    stats: [["16%", "karyawan memakai AI tiap minggu"], ["0", "use case berjalan"], ["Tidak diketahui", "jam dihemat per bulan"]],
    quote: "“Kami sudah mengadakan workshop.”",
    ailene: false,
  },
  {
    title: "Mulai dengan benar, bersama Ailene",
    stats: [["74%", "karyawan memakai AI tiap minggu"], ["18", "use case berjalan"], ["1.240", "jam dihemat per bulan"]],
    quote: "“Ini angkanya.”",
    ailene: true,
  },
] as const;

export default function TwoCompaniesV2BIZ() {
  return (
    <section aria-labelledby="v2-two" className={`${V2_SECTION} bg-v2-paper`}>
      <div className={V2_WRAP}>
        <h2 id="v2-two" className={`${V2_H2} max-w-190`}>
          Dua perusahaan. Awal yang sama. Setahun kemudian.
        </h2>
        <div className="mt-[clamp(28px,4vw,48px)] grid items-stretch gap-3.5 min-[860px]:grid-cols-[1fr_auto_1fr]">
          {companies.map((company, index) => (
            <div key={company.title} className="contents">
              {index === 1 && (
                <span aria-hidden="true" className="grid size-11 place-items-center self-center justify-self-center rounded-full bg-v2-forest text-[0.78rem] font-extrabold text-v2-on-forest">
                  vs
                </span>
              )}
              <article
                aria-label={company.title}
                className={`flex flex-col gap-4.5 rounded-2xl p-[clamp(20px,2.6vw,32px)] ${
                  company.ailene
                    ? "border-2 border-v2-forest bg-white shadow-[0_40px_70px_-48px_rgb(10_32_22/0.45)]"
                    : "border border-v2-rule bg-v2-paper-2 text-v2-ink-3"
                }`}
              >
                <p className="text-[0.78rem] font-bold text-v2-ink-3">Setelah 12 bulan</p>
                <h3 className={`-mt-2.5 font-jakarta text-[clamp(1.2rem,1.8vw,1.5rem)] font-extrabold tracking-[-0.02em] ${company.ailene ? "text-v2-forest" : "text-v2-ink-2"}`}>
                  {company.title}
                </h3>
                <div className="grid grid-cols-3 gap-3.5">
                  {company.stats.map(([figure, label]) => {
                    const isWord = Number.isNaN(Number(figure.replace(/[.%]/g, "")));
                    return (
                      <div key={label}>
                        <b
                          className={`block font-jakarta leading-none font-extrabold tracking-[-0.045em] tabular-nums ${
                            isWord ? "text-[clamp(1rem,1.6vw,1.35rem)] leading-[1.2]" : "text-[clamp(1.6rem,3.4vw,2.8rem)]"
                          } ${company.ailene ? "text-v2-green" : "text-v2-ink-3"}`}
                        >
                          {figure}
                        </b>
                        <span className="mt-2 block text-[0.82rem] leading-[1.35]">{label}</span>
                      </div>
                    );
                  })}
                </div>
                <p className={`mt-auto border-t border-v2-rule pt-3.5 text-[1.08rem] font-bold ${company.ailene ? "text-v2-forest" : "text-v2-ink-2"}`}>
                  <small className="mb-1 block text-[0.74rem] font-bold text-v2-ink-3">Yang didengar Direksi</small>
                  {company.quote}
                </p>
              </article>
            </div>
          ))}
        </div>
        <p className="mt-6 flex flex-wrap items-center gap-3 text-[clamp(1.1rem,1.6vw,1.35rem)]">
          <b>Yang mana perusahaan Anda, 12 bulan dari sekarang?</b>
          <span className={V2_SAMPLE}>Ilustrasi</span>
        </p>
      </div>
    </section>
  );
}
