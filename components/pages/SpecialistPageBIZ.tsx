import AppButton from "@/components/buttons/AppButton";
import SpecialistDivisionExplorerBIZ from "@/components/elements/SpecialistDivisionExplorerBIZ";
import PageMargin from "@/components/layouts/PageMargin";
import FooterHomeBIZ from "@/components/navigations/FooterHomeBIZ";
import HeaderBIZ from "@/components/navigations/HeaderBIZ";
import { specialistDivisions } from "@/lib/biz-specialists";
import Link from "next/link";

const approach = [
  {
    number: "01",
    title: "Mulai dari titik kerja yang nyata",
    copy: "Tes awal dan percakapan dengan stakeholder memetakan kebutuhan tiap peran sebelum kurikulum disusun.",
  },
  {
    number: "02",
    title: "Berlatih dengan materi milik tim",
    copy: "Peserta membawa tugas, dokumen, dan alur kerja yang memang mereka temui setiap minggu.",
  },
  {
    number: "03",
    title: "Tutup kelas dengan bukti kerja",
    copy: "Setiap jalur menghasilkan artefak yang bisa dipakai dan ukuran yang dapat ditinjau bersama manajemen.",
  },
] as const;

const heroOutputIds = new Set(["sales", "hr", "legal"]);

export default function SpecialistPageBIZ() {
  const heroOutputs = specialistDivisions.filter((division) => heroOutputIds.has(division.id));

  return (
    <div className="min-h-screen overflow-x-clip bg-biz-paper text-biz-ink">
      <HeaderBIZ />
      <main>
        <section className="bg-biz-paper-end">
          <PageMargin className="py-5 sm:py-8">
            <div className="grid min-w-0 overflow-hidden rounded-2xl border border-biz-line bg-white lg:min-h-150 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:rounded-3xl">
              <div className="flex min-w-0 flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
                <p className="biz-topic-label self-start">Specialist training</p>
                <h1 className="mt-5 max-w-165 text-[clamp(2.65rem,5.4vw,4.8rem)] leading-[0.94] font-medium tracking-[-0.065em] text-balance text-biz-forest">
                  Training AI dalam bahasa kerja tiap divisi.
                </h1>
                <p className="mt-6 max-w-135 text-base leading-[1.7] text-biz-copy sm:text-lg">
                  Sales berlatih dengan akun yang sedang dikejar, HR dengan SOP, dan Legal dengan checklist klausul. Materi
                  mengikuti tugas, tools, serta risiko kerja mereka.
                </p>
                <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                  <AppButton href="/#contact" variant="lime" size="lg">
                    Susun program untuk tim
                  </AppButton>
                  <a
                    href="#divisi"
                    className="inline-flex min-h-11 items-center text-[15px] font-medium text-biz-forest underline decoration-biz-forest/30 decoration-1 underline-offset-4 transition-colors hover:decoration-biz-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-biz-forest"
                  >
                    Lihat jalur per divisi
                  </a>
                </div>
              </div>

              <aside className="min-w-0 bg-biz-forest px-6 py-9 text-white sm:px-9 sm:py-12 lg:flex lg:flex-col lg:justify-center lg:px-11">
                <p className="text-sm font-medium text-biz-lime">Contoh hasil yang dibawa pulang</p>
                <p className="mt-3 max-w-100 text-[28px] leading-[1.05] font-medium tracking-[-0.05em] sm:text-[34px]">
                  Kelas selesai dengan alat kerja, bukan catatan seminar.
                </p>
                <dl className="mt-8 border-t border-white/18">
                  {heroOutputs.map((division, index) => (
                    <div key={division.id} className="grid grid-cols-[2.25rem_1fr] gap-3 border-b border-white/18 py-4.5">
                      <dt className="text-xs text-biz-lime tabular-nums">{String(index + 1).padStart(2, "0")}</dt>
                      <dd>
                        <p className="text-sm text-white/60">{division.short}</p>
                        <p className="mt-1 text-base leading-snug font-medium text-white">{division.labOutput}</p>
                      </dd>
                    </div>
                  ))}
                </dl>
              </aside>
            </div>
          </PageMargin>
        </section>

        <section id="divisi" aria-labelledby="divisi-title" className="scroll-mt-20 bg-white py-15 sm:py-20">
          <PageMargin>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-end lg:gap-14">
              <h2 id="divisi-title" className="max-w-180 text-[38px] leading-[0.98] font-medium tracking-[-0.06em] text-biz-forest sm:text-[48px]">
                Masuk lewat pekerjaan divisi Anda.
              </h2>
              <p className="max-w-120 text-base leading-[1.65] text-biz-copy">
                Pilih satu divisi. Brief di bawah akan menunjukkan titik kerja, latihan, hasil lab, dan ukuran yang ditinjau.
              </p>
            </div>
            <div className="mt-9 sm:mt-12">
              <SpecialistDivisionExplorerBIZ />
            </div>
            <div className="grid gap-3 border-b border-biz-line py-7 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="max-w-170 text-base leading-[1.6] text-biz-copy">
                Divisi Anda belum ada di daftar? Jalur baru dapat disusun dari diagnostik awal dan pekerjaan yang ingin
                diperbaiki.
              </p>
              <AppButton href="/#contact" variant="forest" size="cta">
                Bahas kebutuhan divisi lain
              </AppButton>
            </div>
          </PageMargin>
        </section>

        <section className="bg-white py-16 sm:py-22">
          <PageMargin>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-16">
              <div>
                <p className="biz-topic-label">Cara kami bekerja</p>
                <h2 className="mt-5 max-w-130 text-[36px] leading-[1] font-medium tracking-[-0.06em] text-biz-forest sm:text-[44px]">
                  Konteks berubah. Standar kerjanya tetap.
                </h2>
                <p className="mt-5 max-w-115 text-base leading-[1.65] text-biz-copy">
                  Kemampuan dipetakan dengan CFTE, lalu dampak program ditinjau dengan Kirkpatrick.
                </p>
                <Link
                  href="/framework"
                  className="mt-6 inline-flex min-h-11 items-center text-sm font-medium text-biz-forest underline decoration-biz-lime decoration-2 underline-offset-4 hover:decoration-biz-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-biz-forest"
                >
                  Baca kerangka evaluasi Ailene
                </Link>
              </div>
              <ol className="border-t border-biz-line">
                {approach.map((step) => (
                  <li key={step.number} className="grid grid-cols-[2.5rem_1fr] gap-4 border-b border-biz-line py-5 sm:grid-cols-[3.5rem_0.75fr_1.25fr] sm:items-start sm:gap-6 sm:py-6">
                    <span className="text-sm font-semibold text-biz-forest-light tabular-nums">{step.number}</span>
                    <h3 className="text-xl leading-tight font-medium tracking-[-0.035em] text-biz-forest">{step.title}</h3>
                    <p className="col-start-2 text-sm leading-[1.65] text-biz-muted sm:col-start-3">{step.copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          </PageMargin>
        </section>

        <section className="bg-biz-forest py-14 text-white sm:py-18">
          <PageMargin className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-10">
            <div>
              <p className="text-sm font-medium text-biz-lime">Program lintas divisi</p>
              <h2 className="mt-2 max-w-170 text-[32px] leading-[1.02] font-medium tracking-[-0.055em] sm:text-[42px]">
                Mulai dari pekerjaan yang ingin tim Anda perbaiki.
              </h2>
            </div>
            <AppButton href="/#contact" variant="lime" size="lg" className="shrink-0">
              Ceritakan kebutuhan tim
            </AppButton>
          </PageMargin>
        </section>
      </main>
      <FooterHomeBIZ isHome={false} />
    </div>
  );
}
