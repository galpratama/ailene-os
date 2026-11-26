import AppButton from "@/components/buttons/AppButton";
import SpecialistDivisionExplorerBIZ from "@/components/elements/SpecialistDivisionExplorerBIZ";
import PageMargin from "@/components/layouts/PageMargin";
import FooterHomeBIZ from "@/components/navigations/FooterHomeBIZ";
import HeaderV2BIZ from "@/components/navigations/HeaderV2BIZ";
import Image from "next/image";
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

export default function SpecialistPageBIZ() {
  return (
    <div className="min-h-screen overflow-x-clip bg-biz-paper text-biz-ink">
      <HeaderV2BIZ page="specialist" />
      <main>
        <section className="bg-biz-paper-end">
          <PageMargin className="py-5 sm:py-8">
            <div className="grid min-w-0 overflow-hidden rounded-2xl border border-biz-line bg-white lg:min-h-155 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:rounded-3xl">
              <div className="flex min-w-0 flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
                <p className="text-sm font-medium text-biz-forest-light">Program specialist per divisi</p>
                <h1 className="mt-5 max-w-170 text-[clamp(2.8rem,5.8vw,5.25rem)] leading-[0.92] font-medium tracking-[-0.07em] text-balance text-biz-forest">
                  Training AI yang dimulai dari pekerjaan tim Anda.
                </h1>
                <p className="mt-6 max-w-140 text-base leading-[1.7] text-biz-copy sm:text-lg">
                  Sales berlatih dengan akun yang sedang dikejar, HR dengan SOP, dan Legal dengan checklist klausul. Materi
                  mengikuti tugas, tools, serta risiko kerja tiap divisi.
                </p>
                <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <AppButton href="/#contact" variant="lime" size="lg">
                    Susun program untuk tim
                  </AppButton>
                  <AppButton href="#divisi" variant="forest" size="lg">
                    Pilih divisi
                  </AppButton>
                </div>
              </div>

              <figure className="relative min-h-105 overflow-hidden bg-biz-sage lg:min-h-full">
                <Image
                  src="/biz/specialist-workshop.webp"
                  alt="Tim profesional Asia berdiskusi bersama di depan laptop dalam ruang kerja"
                  width={1600}
                  height={1067}
                  priority
                  sizes="(min-width: 1024px) 49vw, 100vw"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <figcaption className="absolute right-4 bottom-4 left-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-biz-forest px-4 py-3 text-xs text-white sm:right-6 sm:bottom-6 sm:left-6">
                  <span>Foto ilustrasi sesi kerja kolaboratif</span>
                  <a
                    href="https://www.pexels.com/photo/a-group-of-people-having-a-meeting-in-the-office-7652178/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-biz-lime underline decoration-biz-lime/50 underline-offset-3 hover:decoration-biz-lime focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-biz-lime"
                  >
                    RDNE / Pexels
                  </a>
                </figcaption>
              </figure>
            </div>
          </PageMargin>
        </section>

        <section id="divisi" aria-labelledby="divisi-title" className="scroll-mt-17.5 bg-white py-16 sm:py-22">
          <PageMargin>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] lg:items-end lg:gap-16">
              <div>
                <p className="text-sm font-medium text-biz-forest-light">Jalur specialist</p>
                <h2 id="divisi-title" className="mt-4 max-w-180 text-[clamp(2.5rem,5.4vw,5rem)] leading-[0.93] font-medium tracking-[-0.065em] text-balance text-biz-forest">
                  Satu divisi, satu konteks kerja.
                </h2>
              </div>
              <p className="max-w-125 text-base leading-[1.7] text-biz-copy">
                Pilih divisi untuk melihat titik kerja, latihan, hasil lab, dan ukuran yang ditinjau setelah kelas.
              </p>
            </div>

            <div className="mt-10 sm:mt-13">
              <SpecialistDivisionExplorerBIZ />
            </div>

            <div className="grid gap-5 border-b border-biz-line py-8 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="max-w-170 text-base leading-[1.65] text-biz-copy">
                Divisi Anda belum ada di daftar? Jalur baru dapat disusun dari diagnostik awal dan pekerjaan yang ingin
                diperbaiki.
              </p>
              <AppButton href="/#contact" variant="forest" size="cta">
                Bahas kebutuhan divisi lain
              </AppButton>
            </div>
          </PageMargin>
        </section>

        <section className="bg-biz-paper-end py-5 sm:py-8">
          <PageMargin>
            <div className="overflow-hidden rounded-2xl border border-biz-line bg-white px-6 py-12 sm:px-10 sm:py-16 lg:rounded-3xl lg:px-14 lg:py-20">
              <div className="grid gap-9 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-18">
                <div>
                  <p className="text-sm font-medium text-biz-forest-light">Cara program disusun</p>
                  <h2 className="mt-4 max-w-135 text-[clamp(2.35rem,4.7vw,4.6rem)] leading-[0.94] font-medium tracking-[-0.065em] text-balance text-biz-forest">
                    Konteks berubah. Standar kerjanya tetap.
                  </h2>
                  <p className="mt-6 max-w-115 text-base leading-[1.7] text-biz-copy">
                    Kemampuan dipetakan dengan CFTE, lalu dampak program ditinjau dengan Kirkpatrick.
                  </p>
                  <Link
                    href="/framework"
                    className="mt-7 inline-flex min-h-11 items-center text-sm font-medium text-biz-forest underline decoration-biz-lime decoration-2 underline-offset-4 transition-colors hover:decoration-biz-forest focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-biz-forest"
                  >
                    Baca kerangka evaluasi Ailene
                  </Link>
                </div>

                <ol className="border-t border-biz-line">
                  {approach.map((step) => (
                    <li
                      key={step.number}
                      className="grid grid-cols-[2.5rem_1fr] gap-x-4 gap-y-3 border-b border-biz-line py-5 sm:grid-cols-[3rem_minmax(10rem,0.85fr)_minmax(0,1.15fr)] sm:items-start sm:gap-6 sm:py-7"
                    >
                      <span className="text-sm font-semibold text-biz-forest-light tabular-nums">{step.number}</span>
                      <h3 className="text-xl leading-tight font-medium tracking-[-0.035em] text-biz-forest">{step.title}</h3>
                      <p className="col-start-2 text-sm leading-[1.7] text-biz-muted sm:col-start-3">{step.copy}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </PageMargin>
        </section>

        <section className="bg-biz-lime py-14 text-biz-forest sm:py-18">
          <PageMargin className="grid gap-7 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-10">
            <div>
              <p className="text-sm font-medium">Program lintas divisi</p>
              <h2 className="mt-3 max-w-190 text-[clamp(2.25rem,4.8vw,4.8rem)] leading-[0.93] font-medium tracking-[-0.065em] text-balance">
                Mulai dari pekerjaan yang ingin tim Anda perbaiki.
              </h2>
            </div>
            <AppButton href="/#contact" variant="forest" size="lg" className="shrink-0">
              Ceritakan kebutuhan tim
            </AppButton>
          </PageMargin>
        </section>
      </main>
      <FooterHomeBIZ isHome={false} />
    </div>
  );
}
