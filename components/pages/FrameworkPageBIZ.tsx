import AppButton from "@/components/buttons/AppButton";
import FrameworkCapabilityBIZ from "@/components/elements/FrameworkCapabilityBIZ";
import FrameworkEvidenceBIZ from "@/components/elements/FrameworkEvidenceBIZ";
import FrameworkImpactBIZ from "@/components/elements/FrameworkImpactBIZ";
import PageMargin from "@/components/layouts/PageMargin";
import FooterHomeBIZ from "@/components/navigations/FooterHomeBIZ";
import HeaderBIZ from "@/components/navigations/HeaderBIZ";
import SectionHeaderHomeBIZ from "@/components/static-sections/SectionHeaderHomeBIZ";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";

export default function FrameworkPageBIZ() {
  return (
    <div className="min-h-screen bg-biz-paper text-biz-ink [&_[id]]:scroll-mt-20">
      <HeaderBIZ />
      <main>
        <section className="bg-biz-paper-end py-18 sm:py-24">
          <PageMargin className="grid items-center gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:gap-13">
            <div>
              <p className="biz-topic-label">Framework di balik training</p>
              <h1 className="mt-4 max-w-135 text-[38px] leading-[0.98] font-medium tracking-[-0.065em] text-biz-forest sm:text-[50px] lg:text-[56px]">
                Training AI yang bisa dibuktikan.
              </h1>
              <p className="mt-5 max-w-112 text-[15px] leading-[1.7] text-biz-copy">
                CFTE memetakan kemampuan. Kirkpatrick menelusuri dampaknya sampai pekerjaan.
              </p>
              <AppButton href="#cfte" variant="forest" size="cta" className="mt-7">
                Lihat cara kerjanya <ArrowDown size={17} aria-hidden="true" />
              </AppButton>
            </div>
            <div className="relative min-w-0 overflow-hidden rounded-2xl border border-biz-forest/10 bg-biz-forest shadow-[0_24px_60px_rgba(1,30,22,0.13)]">
              <Image
                src="/biz/hero-training.jpg"
                alt="Peserta dan trainer Ailene dalam sesi AI adoption training"
                width={1400}
                height={700}
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
                className="h-75 w-full object-cover sm:h-95 lg:h-110"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-biz-forest via-biz-forest/80 to-transparent px-4 pt-15 pb-4 sm:px-6 sm:pb-6">
                <p className="font-mono text-[10px] tracking-[0.15em] text-biz-lime uppercase">Ailene / AI adoption training</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] font-medium text-white sm:text-[13px]">
                  {["Peta awal", "Praktik nyata", "Bukti dampak"].map((label, index) => (
                    <span key={label} className="flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/10 px-2.5 py-2 backdrop-blur-sm">
                      <span className="biz-proof-node size-1.5 shrink-0 rounded-full bg-biz-lime" style={{ animationDelay: `${index * 0.55}s` }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </PageMargin>
        </section>

        <section id="cfte" className="bg-white py-18 sm:py-26">
          <PageMargin>
            <SectionHeaderHomeBIZ
              eyebrow="01 / CFTE AI Proficiency Framework"
              title="Kemampuan dipetakan sejak awal."
              copy="Tiga tingkat kemahiran membantu kami menyesuaikan latihan dengan peran peserta."
            />
            <FrameworkCapabilityBIZ />
          </PageMargin>
        </section>

        <section id="kirkpatrick" className="bg-biz-forest py-18 text-white sm:py-26">
          <PageMargin>
            <SectionHeaderHomeBIZ
              eyebrow="02 / Kirkpatrick Model"
              title="Dampak dilihat sampai ke pekerjaan."
              copy="Empat level evaluasi menjaga ukuran keberhasilan tetap jelas."
              dark
            />
            <FrameworkImpactBIZ />
          </PageMargin>
        </section>

        <section className="bg-biz-paper py-18 sm:py-26">
          <PageMargin>
            <SectionHeaderHomeBIZ
              eyebrow="Jejak bukti Ailene"
              title="Bukti mengikuti perjalanan training."
              copy="Dari kebutuhan awal, praktik peserta, hingga tindak lanjut."
            />
            <FrameworkEvidenceBIZ />
            <div className="mt-10 flex flex-col gap-5 rounded-2xl bg-biz-forest p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-biz-lime uppercase">Untuk tim Anda</p>
                <h2 className="mt-2 text-[28px] leading-[1.05] font-medium tracking-[-0.055em] sm:text-[34px]">Rancang training dengan tolok ukur yang jelas.</h2>
              </div>
              <AppButton href="/#contact" variant="lime" size="cta" className="shrink-0">Konsultasi gratis <ArrowUpRight size={17} aria-hidden="true" /></AppButton>
            </div>
            <p className="mt-6 max-w-215 text-xs leading-[1.7] text-biz-muted">
              Acuan: <a href="https://www.cfte.education/aipf-levels" target="_blank" rel="noopener noreferrer" className="font-medium text-biz-forest underline underline-offset-2">CFTE AI Proficiency Framework</a> oleh Huy Nguyen Trieu (2026; ringkasan diadaptasi oleh Ailene, <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">CC BY-SA 4.0</a>) dan <a href="https://www.kirkpatrickpartners.com/wp-content/uploads/2024/04/the-kirkpatrick-model-how-to-improve-training-creando-valorrh-july-august-2017.pdf" target="_blank" rel="noopener noreferrer" className="font-medium text-biz-forest underline underline-offset-2">Kirkpatrick Partners</a>. Diagram penerapan adalah interpretasi Ailene; bukan asesmen atau sertifikasi resmi kedua lembaga.
            </p>
          </PageMargin>
        </section>
      </main>
      <FooterHomeBIZ isHome={false} />
    </div>
  );
}
