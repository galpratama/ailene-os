import AppButton from "@/components/buttons/AppButton";
import SpecialistDivisionCardBIZ from "@/components/elements/SpecialistDivisionCardBIZ";
import PageMargin from "@/components/layouts/PageMargin";
import FooterHomeBIZ from "@/components/navigations/FooterHomeBIZ";
import HeaderBIZ from "@/components/navigations/HeaderBIZ";
import SpecialistDivisionNavBIZ from "@/components/navigations/SpecialistDivisionNavBIZ";
import SectionHeaderHomeBIZ from "@/components/static-sections/SectionHeaderHomeBIZ";
import { CASE_STUDY_PUBLISHED, HUTAMA_KARYA_CASE_PATH, hutamaKaryaCase } from "@/lib/biz-case-studies";
import { specialistDivisions } from "@/lib/biz-specialists";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const approach = [
  { number: "01", title: "Diagnostik per peran", copy: "Tes awal dan survei memetakan titik berangkat tiap divisi, bukan rata-rata perusahaan." },
  { number: "02", title: "Lab dengan pekerjaan sendiri", copy: "Peserta membawa tugas nyata divisinya. Contoh kelas diganti dengan use case mereka." },
  { number: "03", title: "Bukti per divisi", copy: "Hasil lab dan jam kerja yang dihemat dicatat per bagian, lalu dilaporkan ke manajemen." },
] as const;

export default function SpecialistPageBIZ() {
  const proof = hutamaKaryaCase.headline.slice(0, 3);

  return (
    <div className="min-h-screen bg-biz-paper text-biz-ink">
      <HeaderBIZ />
      <main>
        <section className="bg-biz-paper-end py-16 sm:py-22">
          <PageMargin className="grid items-center gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-13">
            <div>
              <p className="biz-topic-label">Specialist training</p>
              <h1 className="mt-4 max-w-140 text-[38px] leading-[0.98] font-medium tracking-[-0.065em] text-biz-forest sm:text-[50px] lg:text-[56px]">
                Training AI dalam bahasa kerja tiap divisi.
              </h1>
              <p className="mt-5 max-w-118 text-[15px] leading-[1.7] text-biz-copy">
                Sales tidak belajar dari contoh HR. Legal tidak berlatih dengan data marketing. Setiap divisi praktik di tugas,
                tools, dan risikonya sendiri.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <AppButton href="#divisi" variant="forest" size="cta">
                  Pilih divisi <ArrowDown size={17} aria-hidden="true" />
                </AppButton>
                <AppButton href="/#contact" variant="lime" size="cta">
                  Konsultasi gratis <ArrowUpRight size={17} aria-hidden="true" />
                </AppButton>
              </div>
            </div>

            <div className="rounded-2xl bg-biz-forest p-4 shadow-[0_24px_60px_rgba(1,30,22,0.13)] sm:p-6">
              <div className="flex items-center justify-between gap-3 border-b border-white/12 pb-4">
                <p className="text-[11px] font-semibold tracking-[0.15em] text-biz-lime uppercase">9 jalur divisi</p>
                <p className="text-xs text-white/60">Satu kerangka, konteks berbeda</p>
              </div>
              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {specialistDivisions.map((division, index) => {
                  const Icon = division.icon;
                  return (
                    <li key={division.id}>
                      <a
                        href={`#${division.id}`}
                        className="group flex h-full min-h-24 flex-col justify-between gap-3 rounded-xl border border-white/12 bg-white/6 p-3.5 text-white transition-colors hover:border-biz-lime/60 hover:bg-white/10 sm:min-h-28"
                      >
                        <span className="flex items-center justify-between">
                          <Icon size={20} className="text-biz-lime" aria-hidden="true" />
                          <span className="text-[10px] text-white/45 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                        </span>
                        <span className="flex items-end justify-between gap-2 text-sm leading-tight font-medium">
                          {division.short}
                          <ArrowRight size={15} className="shrink-0 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-biz-lime" aria-hidden="true" />
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </PageMargin>
        </section>

        {/* The wrapper bounds the sticky division nav to the division list. */}
        <div>
          <SpecialistDivisionNavBIZ />

          <section id="divisi" aria-labelledby="divisi-title" className="scroll-mt-20 py-16 sm:py-22">
            <PageMargin>
              <SectionHeaderHomeBIZ
                eyebrow="Kurikulum per divisi"
                title={<span id="divisi-title">Use case, hasil lab, dan ukuran berbeda untuk tiap tim.</span>}
                copy="Fondasinya sama: aman, terverifikasi, dan terukur. Yang berubah adalah pekerjaan yang dilatih."
              />
              <div className="grid gap-4 sm:gap-5">
                {specialistDivisions.map((division, index) => (
                  <SpecialistDivisionCardBIZ key={division.id} division={division} index={index} />
                ))}
              </div>
              <p className="mt-6 text-sm text-biz-muted">
                Divisi Anda belum ada di daftar? Kami menyusun jalur custom dari hasil diagnostik awal.
              </p>
            </PageMargin>
          </section>
        </div>

        <section className="bg-white py-16 sm:py-22">
          <PageMargin>
            <SectionHeaderHomeBIZ
              eyebrow="Cara kami menyesuaikan"
              title="Satu kerangka, sembilan konteks."
              copy="Kemampuan dipetakan dengan CFTE, dampaknya ditelusuri dengan Kirkpatrick."
            />
            <ol className="grid gap-3 sm:grid-cols-3">
              {approach.map((step) => (
                <li key={step.number} className="rounded-2xl border border-biz-line bg-biz-panel p-5 sm:p-6">
                  <span className="grid size-9 place-items-center rounded-full bg-biz-forest text-xs font-semibold text-biz-lime tabular-nums">{step.number}</span>
                  <h3 className="mt-5 text-xl leading-tight font-medium tracking-[-0.045em] text-biz-forest">{step.title}</h3>
                  <p className="mt-2 text-sm leading-[1.65] text-biz-muted">{step.copy}</p>
                </li>
              ))}
            </ol>
            <Link href="/framework" className="mt-6 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-biz-forest underline decoration-biz-lime decoration-2 underline-offset-4 hover:decoration-biz-forest">
              Pelajari framework-nya <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </PageMargin>
        </section>

        {CASE_STUDY_PUBLISHED && (
          <section className="bg-biz-forest py-16 text-white sm:py-22">
            <PageMargin className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-13">
              <figure className="overflow-hidden rounded-2xl border border-white/10">
                <Image
                  src={hutamaKaryaCase.hero.src}
                  alt={hutamaKaryaCase.hero.alt}
                  width={1600}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 52vw"
                  className="aspect-video w-full object-cover"
                />
              </figure>
              <div>
                <p className="text-[11px] font-semibold tracking-[0.15em] text-biz-lime uppercase">Studi kasus · Human Capital</p>
                <h2 className="mt-3 text-[32px] leading-[1.02] font-medium tracking-[-0.06em] sm:text-[40px]">
                  Tim Human Capital Hutama Karya belajar AI dari tugasnya sendiri.
                </h2>
                <dl className="mt-7 grid grid-cols-3 gap-3 border-y border-white/12 py-5">
                  {proof.map((item) => (
                    <div key={item.label} className="flex flex-col-reverse">
                      <dt className="mt-1 text-xs leading-snug text-white/60">{item.label}</dt>
                      <dd className="font-medium tracking-[-0.05em] tabular-nums">
                        <span className="text-[28px] text-biz-lime sm:text-[34px]">{item.value}</span>
                        <span className="ml-1 text-sm text-white/70">{item.unit}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
                <AppButton href={HUTAMA_KARYA_CASE_PATH} variant="lime" size="cta" className="mt-7">
                  Baca studi kasus <ArrowUpRight size={17} aria-hidden="true" />
                </AppButton>
              </div>
            </PageMargin>
          </section>
        )}

        <section className="bg-biz-paper py-16 sm:py-20">
          <PageMargin>
            <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 ring-1 ring-biz-line sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-biz-forest-light uppercase">Untuk tim Anda</p>
                <h2 className="mt-2 max-w-140 text-[28px] leading-[1.05] font-medium tracking-[-0.055em] text-biz-forest sm:text-[34px]">
                  Gabungkan beberapa divisi dalam satu program.
                </h2>
              </div>
              <AppButton href="/#contact" variant="forest" size="cta" className="shrink-0">
                Konsultasi gratis <ArrowUpRight size={17} aria-hidden="true" />
              </AppButton>
            </div>
          </PageMargin>
        </section>
      </main>
      <FooterHomeBIZ isHome={false} />
    </div>
  );
}
