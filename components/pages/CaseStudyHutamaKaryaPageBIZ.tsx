import AppButton from "@/components/buttons/AppButton";
import CaseStudyGalleryBIZ from "@/components/elements/CaseStudyGalleryBIZ";
import CaseStudyScoreChartBIZ from "@/components/elements/CaseStudyScoreChartBIZ";
import CaseStudyTimelineBIZ from "@/components/elements/CaseStudyTimelineBIZ";
import PageMargin from "@/components/layouts/PageMargin";
import FooterHomeBIZ from "@/components/navigations/FooterHomeBIZ";
import HeaderBIZ from "@/components/navigations/HeaderBIZ";
import SectionHeaderHomeBIZ from "@/components/static-sections/SectionHeaderHomeBIZ";
import { hutamaKaryaCase as hk } from "@/lib/biz-case-studies";
import { ArrowUpRight, ChevronRight, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CaseStudyHutamaKaryaPageBIZ() {
  return (
    <div className="min-h-screen bg-biz-paper text-biz-ink [&_[id]]:scroll-mt-20">
      <HeaderBIZ />
      <main>
        <section className="bg-biz-paper-end pt-8 pb-14 sm:pt-10 sm:pb-20">
          <PageMargin>
            <nav aria-label="Breadcrumb" className="text-[13px] text-biz-muted">
              <ol className="flex flex-wrap items-center gap-1">
                <li><Link href="/" className="hover:text-biz-forest">Beranda</Link></li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li>Studi kasus</li>
                <li aria-hidden="true"><ChevronRight size={14} /></li>
                <li aria-current="page" className="font-medium text-biz-forest">Hutama Karya</li>
              </ol>
            </nav>

            <div className="mt-8 grid items-center gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-13">
              <div>
                <Image src={hk.logo} alt="Danantara Indonesia dan Hutama Karya" width={720} height={118} priority className="h-8 w-auto sm:h-9" />
                <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-biz-forest ring-1 ring-biz-line">
                  <span className="biz-proof-node size-2 rounded-full bg-biz-forest-light" aria-hidden="true" />
                  Program berjalan · data per {hk.dataAsOf}
                </p>
                <h1 className="mt-4 text-[36px] leading-[0.98] font-medium tracking-[-0.065em] text-biz-forest sm:text-[48px] lg:text-[52px]">
                  36 insan Human Capital Hutama Karya belajar AI dari tugasnya sendiri.
                </h1>
                <p className="mt-5 max-w-122 text-[15px] leading-[1.7] text-biz-copy">
                  Program AI Fundamentals delapan sesi untuk tim Human Capital PT Hutama Karya (Persero), BUMN konstruksi dalam ekosistem
                  Danantara Indonesia. Setiap sesi menghasilkan aset kerja yang nyata, dan setiap kemajuan tercatat di LMS.
                </p>
              </div>
              <figure className="relative overflow-hidden rounded-2xl border border-biz-forest/10 bg-biz-forest shadow-[0_24px_60px_rgba(1,30,22,0.13)]">
                <Image
                  src={hk.hero.src}
                  alt={hk.hero.alt}
                  width={1600}
                  height={900}
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="aspect-video w-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-linear-to-t from-biz-forest/90 to-transparent px-4 pt-14 pb-3.5 text-[13px] text-white/85 sm:px-5">
                  Sesi 1, luring: Raymond Chin membuka dengan cara kerja AI tanpa jargon.
                </figcaption>
              </figure>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-biz-line bg-biz-line sm:grid-cols-3 lg:grid-cols-6">
              {hk.facts.map((fact) => (
                <div key={fact.label} className="bg-white px-4 py-3.5">
                  <dt className="text-[11px] font-semibold tracking-[0.14em] text-biz-muted uppercase">{fact.label}</dt>
                  <dd className="mt-1 text-sm leading-snug font-medium text-biz-forest">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </PageMargin>
        </section>

        <section aria-labelledby="hasil-utama" className="bg-biz-forest py-14 text-white sm:py-18">
          <PageMargin>
            <h2 id="hasil-utama" className="text-[11px] font-semibold tracking-[0.15em] text-biz-lime uppercase">Hasil utama sesi 1</h2>
            <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
              {hk.headline.map((item) => (
                <div key={item.label} className="flex flex-col-reverse border-l border-white/15 pl-4 sm:pl-5">
                  <dt>
                    <span className="mt-2 block text-sm leading-snug font-medium text-white">{item.label}</span>
                    <span className="mt-1 block text-xs text-white/55">{item.note}</span>
                  </dt>
                  <dd className="font-medium tracking-[-0.06em] tabular-nums">
                    <span className="text-[44px] leading-none text-biz-lime sm:text-[56px]">{item.value}</span>
                    <span className="ml-1.5 text-base tracking-normal text-white/70">{item.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </PageMargin>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <PageMargin className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div>
              <p className="biz-topic-label">Tantangan</p>
              <h2 className="mt-3.5 text-[32px] leading-[0.98] font-medium tracking-[-0.06em] text-biz-ink sm:text-[40px]">
                Bukan sekadar bisa memakai AI.
              </h2>
              <div className="mt-5 grid gap-4 text-[15px] leading-[1.7] text-biz-copy">
                <p>
                  Sebagian besar peserta berangkat dari titik pemula. Pekerjaan Human Capital penuh data pribadi, jadi kebiasaan
                  aman harus terbentuk sebelum kecepatan.
                </p>
                <p>
                  Manajemen juga butuh jawaban yang bisa dipertanggungjawabkan: berapa jam kerja yang benar-benar dihemat, di bagian
                  mana, dan oleh siapa.
                </p>
              </div>
            </div>
            <div>
              <p className="biz-topic-label">Pendekatan</p>
              <ol className="mt-5 grid gap-3 sm:grid-cols-3">
                {hk.pillars.map((pillar, index) => (
                  <li key={pillar.title} className="rounded-2xl border border-biz-line bg-biz-panel p-4.5">
                    <span className="text-xs font-semibold text-biz-forest-light tabular-nums">0{index + 1}</span>
                    <h3 className="mt-3 text-lg leading-tight font-medium tracking-[-0.04em] text-biz-forest">{pillar.title}</h3>
                    <p className="mt-1.5 text-[13px] leading-[1.6] text-biz-muted">{pillar.copy}</p>
                  </li>
                ))}
              </ol>
              <dl className="mt-5 divide-y divide-biz-line border-y border-biz-line">
                {hk.roles.map((item) => (
                  <div key={item.role} className="grid gap-1 py-3.5 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4">
                    <dt className="text-sm font-semibold text-biz-forest">{item.role}</dt>
                    <dd className="text-sm leading-[1.6] text-biz-copy">{item.copy}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </PageMargin>
        </section>

        <section className="bg-biz-paper py-16 sm:py-24">
          <PageMargin>
            <SectionHeaderHomeBIZ
              eyebrow="Hasil sejauh ini"
              title="Skor naik di keempat bagian Human Capital."
              copy="Dihitung per peserta yang mengikuti pre-test dan post-test, lalu dirata-ratakan. Bukan dua populasi berbeda yang dibandingkan."
            />
            <CaseStudyScoreChartBIZ />
            <div className="mt-4 flex gap-3 rounded-2xl bg-biz-panel-soft p-4 text-sm leading-[1.65] text-biz-copy sm:p-5">
              <Info size={18} className="mt-0.5 shrink-0 text-biz-forest-light" aria-hidden="true" />
              <p>
                Sesi 2 dimulai dari pre-test yang sudah tinggi (rata-rata {hk.sessionTwo.pre.toLocaleString("id-ID")}) dan baru{" "}
                {hk.sessionTwo.paired} peserta menyelesaikan post-test, dengan kenaikan +{hk.sessionTwo.change.toLocaleString("id-ID")} poin.
                Sampel itu masih terlalu kecil untuk disimpulkan, jadi belum kami jadikan klaim.
              </p>
            </div>
          </PageMargin>
        </section>

        <section className="bg-biz-forest py-16 text-white sm:py-24">
          <PageMargin className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">
            <div>
              <SectionHeaderHomeBIZ
                eyebrow="Perjalanan program"
                title="Delapan Jumat, dari prompt pertama sampai Super Agent."
                dark
                className="!mb-0 !block"
              />
              <p className="mt-5 max-w-100 text-[15px] leading-[1.65] text-white/62">
                Dua sesi luring membuka dan menutup program. Enam sesi Operator di antaranya berjalan daring, masing-masing tiga jam.
              </p>
            </div>
            <CaseStudyTimelineBIZ />
          </PageMargin>
        </section>

        <section className="bg-white py-16 sm:py-24">
          <PageMargin>
            <SectionHeaderHomeBIZ
              eyebrow="Di dalam kelas"
              title="Belajar dengan tugas Human Capital yang nyata."
              copy="Rekap cuti, pengumuman internal, dan pertanyaan karyawan menjadi bahan latihan, setelah datanya dipilah lewat Traffic Light."
            />
            <CaseStudyGalleryBIZ />
          </PageMargin>
        </section>

        <section className="bg-biz-paper py-16 sm:py-24">
          <PageMargin>
            <SectionHeaderHomeBIZ
              eyebrow="Aset yang dibangun"
              title="Setiap tingkat meninggalkan hasil kerja."
              copy="Aset dari sesi awal dipakai ulang di sesi berikutnya, sehingga di Capstone peserta tidak mulai dari nol."
            />
            <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {hk.assets.map((asset, index) => (
                <li key={asset.level} className={`rounded-2xl p-5 ${index === 3 ? "bg-biz-lime/35 ring-1 ring-biz-forest-light/30" : "bg-white ring-1 ring-biz-line"}`}>
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-biz-forest-light uppercase">{asset.level}</p>
                  <h3 className="mt-2 text-xl leading-tight font-medium tracking-[-0.045em] text-biz-forest">{asset.name}</h3>
                  <p className="mt-2 text-sm leading-[1.6] text-biz-copy">{asset.output}</p>
                </li>
              ))}
            </ol>
          </PageMargin>
        </section>

        <section className="bg-white py-16 sm:py-22">
          <PageMargin className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
            <div>
              <p className="biz-topic-label">Fasilitator</p>
              <h2 className="mt-3.5 text-[32px] leading-[0.98] font-medium tracking-[-0.06em] text-biz-ink sm:text-[40px]">
                Praktisi yang menjalankan AI setiap hari.
              </h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {hk.facilitators.map((person) => (
                <li key={person.name} className="flex items-center gap-4 rounded-2xl border border-biz-line bg-biz-panel p-3.5">
                  <span className={`relative size-20 shrink-0 overflow-hidden rounded-xl ${person.background}`}>
                    <Image src={person.image} alt={`Foto ${person.name}`} fill sizes="80px" className="object-cover object-top" />
                  </span>
                  <span>
                    <span className="block text-lg leading-tight font-medium tracking-[-0.04em] text-biz-forest">{person.name}</span>
                    <span className="mt-1 block text-[13px] text-biz-muted">{person.role}</span>
                  </span>
                </li>
              ))}
            </ul>
          </PageMargin>
        </section>

        <section className="bg-biz-paper pt-4 pb-16 sm:pb-20">
          <PageMargin>
            <div className="flex flex-col gap-5 rounded-2xl bg-biz-forest p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-biz-lime uppercase">Untuk tim Anda</p>
                <h2 className="mt-2 max-w-140 text-[28px] leading-[1.05] font-medium tracking-[-0.055em] sm:text-[34px]">
                  Rancang program AI dengan bukti yang bisa dilaporkan.
                </h2>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <AppButton href="/specialist" variant="outlineDark" size="cta">Lihat jalur divisi</AppButton>
                <AppButton href="/#contact" variant="lime" size="cta">
                  Konsultasi gratis <ArrowUpRight size={17} aria-hidden="true" />
                </AppButton>
              </div>
            </div>
            <p className="mt-6 max-w-215 text-xs leading-[1.7] text-biz-muted">
              Sumber data: ekstraksi LMS Ailene per {hk.dataAsOf}, mencakup 36 akun peserta pada grup non-test. Akun champion dan
              grup internal tidak dihitung. Penyelesaian materi tidak sama dengan kehadiran sesi. Angka akan diperbarui setelah
              Capstone.
            </p>
          </PageMargin>
        </section>
      </main>
      <FooterHomeBIZ isHome={false} />
    </div>
  );
}
