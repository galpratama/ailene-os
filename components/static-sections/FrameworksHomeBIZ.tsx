import AppButton from "@/components/buttons/AppButton";
import PageMargin from "@/components/layouts/PageMargin";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

export default function FrameworksHomeBIZ() {
  return (
    <section id="framework" className="overflow-hidden border-y border-biz-line bg-biz-sage py-18 text-biz-ink sm:py-26">
      <PageMargin className="grid items-center gap-9 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
        <div>
          <p className="text-xs font-semibold tracking-[0.17em] text-biz-forest-light uppercase">Framework di balik training</p>
          <h2 className="mt-4 max-w-110 text-[36px] leading-[0.98] font-medium tracking-[-0.065em] text-biz-forest lg:text-[44px]">
            Hasil training punya jejak bukti.
          </h2>
          <p className="mt-5 max-w-100 text-[15px] leading-[1.65] text-biz-copy">CFTE memetakan kemampuan. Kirkpatrick menelusuri dampaknya.</p>
          <AppButton href="/framework" variant="lime" size="cta" className="mt-7">
            Lihat framework <ArrowUpRight size={17} aria-hidden="true" />
          </AppButton>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-biz-line bg-white p-5 text-biz-forest shadow-[0_18px_40px_-28px_rgba(1,30,22,0.35)] sm:p-6">
            <div className="flex items-center gap-2.5">
              <Image src="/biz/logo-cfte.webp" alt="Logo CFTE" width={40} height={40} className="size-10 rounded-lg object-cover" />
              <div><p className="font-mono text-[10px] tracking-wide text-biz-muted">CFTE</p><p className="text-[15px] font-medium">Peta kemampuan</p></div>
            </div>
            <div className="relative mt-6 pl-6 before:absolute before:top-3 before:bottom-3 before:left-2.5 before:w-px before:bg-biz-forest-light/35">
              {["AI Literacy", "Applied AI Practitioner", "AI Systems & Decision Leader"].map((level, index) => (
                <div key={level} className="biz-proof-branch relative mt-2 flex items-center gap-3 rounded-lg bg-biz-panel px-3 py-3 first:mt-0" style={{ animationDelay: `${index * 0.6}s` }}>
                  <span className="biz-proof-node absolute top-1/2 -left-5.5 -mt-1.25 size-2.5 rounded-full bg-biz-forest-light" style={{ animationDelay: `${index * 0.6}s` }} />
                  <span className="font-mono text-[10px] text-biz-forest-light">0{index + 1}</span>
                  <span className="text-[12px] leading-tight font-medium sm:text-[13px]">{level}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-biz-forest/10 bg-biz-lime p-5 text-biz-forest shadow-[0_18px_40px_-28px_rgba(1,30,22,0.35)] sm:p-6">
            <div><p className="font-mono text-[10px] tracking-wide">KIRKPATRICK</p><p className="mt-1 text-[15px] font-medium">Piramida dampak</p></div>
            <div className="mt-6 flex flex-col items-center gap-1">
              {[
                ["04", "Hasil", "w-[46%] bg-biz-forest-light text-white"],
                ["03", "Perilaku", "w-[62%] bg-biz-forest-light/70 text-white"],
                ["02", "Belajar", "w-[80%] bg-biz-mint text-biz-forest"],
                ["01", "Reaksi", "w-full bg-white text-biz-forest"],
              ].map(([number, label, tone], index) => (
                <div key={number} className={`biz-proof-pyramid-layer flex h-10 items-center justify-center gap-1.5 text-[12px] font-semibold ${tone}`} style={{ animationDelay: `${index * 0.6}s` }}><span className="font-mono text-[9px] opacity-65">{number}</span>{label}</div>
              ))}
            </div>
          </div>
        </div>
      </PageMargin>
    </section>
  );
}
