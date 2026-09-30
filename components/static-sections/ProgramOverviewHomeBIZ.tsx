import { ArrowRight, Check } from "lucide-react";
import { programOverview } from "@/lib/biz-content";
import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";
import PageMargin from "@/components/layouts/PageMargin";
import AppButton from "@/components/buttons/AppButton";

const divisions = [
  "Finance",
  "Marketing",
  "Sales",
  "HR",
  "Operations",
  "Procurement",
  "Legal",
  "IT & Developer",
];

export default function ProgramOverviewHomeBIZ() {
  return (
    <section id="program-overview" className="bg-white py-18 sm:py-28">
      <PageMargin>
        <SectionHeaderHomeBIZ
          centered
          eyebrow="Pilihan program"
          title="Tingkatkan kompetensi AI karyawan"
          className="!mb-0"
        />
        {/* Rendered here instead of via `copy` so it can step up to text-base on desktop. */}
        <p className="mx-auto mt-4 mb-8.5 max-w-140 text-center text-[15px] leading-[1.65] text-biz-muted sm:mb-10.5 lg:text-base">
          Pilih paket sesuai kesiapan tim. Kami sesuaikan materi dengan
          bisnis/industrimu. Mulai dari 15 peserta.
        </p>

        <div className="grid gap-3.5 md:grid-cols-3">
          {programOverview.map((program) => (
            <article
              key={program.name}
              className={`flex flex-col rounded-2xl border p-6 sm:p-7 ${
                program.recommended
                  ? "border-biz-forest bg-biz-forest text-white"
                  : "border-biz-forest/10 bg-biz-paper text-biz-ink"
              }`}
            >
              <span
                className={`self-start rounded-full px-2.5 py-1.5 font-mono text-[11px] leading-none tracking-[0.08em] uppercase ${
                  program.recommended
                    ? "bg-biz-lime text-biz-forest"
                    : "bg-biz-forest/7 text-biz-muted"
                }`}
              >
                {program.duration} · {program.format}
              </span>
              <h3 className="mt-6 text-[26px] leading-[1.05] font-medium tracking-[-0.05em]">
                {program.name}
              </h3>
              <p
                className={`mt-2.5 mb-6 text-[15px] leading-[1.55] ${
                  program.recommended ? "text-white/80" : "text-biz-ink/75"
                }`}
              >
                {program.description}
              </p>
              <div
                className={`mb-8 border-t pt-4 ${
                  program.recommended
                    ? "border-white/15 text-white/80"
                    : "border-biz-forest/10 text-biz-ink/80"
                }`}
              >
                <span className="mb-3 block font-mono text-[10px] tracking-[0.1em] uppercase opacity-75">
                  Yang tim dapat
                </span>
                {program.includes && (
                  <p
                    className={`mb-2.5 text-[15px] leading-[1.4] font-medium ${
                      program.recommended ? "text-white" : "text-biz-ink"
                    }`}
                  >
                    {program.includes}
                  </p>
                )}
                <ul className="grid gap-2.5 text-[15px] leading-[1.4]">
                  {program.takeaways.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full ${
                          program.recommended
                            ? "bg-biz-lime text-biz-forest"
                            : "bg-biz-forest-light text-white"
                        }`}
                      >
                        <Check size={11} strokeWidth={3} />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <AppButton
                href="#contact"
                variant={program.recommended ? "lime" : "white"}
                size="cta"
                trackPlacement="program_overview"
                className="mt-auto w-full"
              >
                Diskusikan paket ini
                {program.recommended && <ArrowRight size={16} />}
              </AppButton>
            </article>
          ))}
        </div>

        {/* One line always: centered on desktop, swipes sideways on narrow screens. */}
        <div className="mt-8 overflow-x-auto [scrollbar-width:none]">
          <div className="mx-auto flex w-max items-center gap-2 text-base">
            <span className="mr-1 font-medium whitespace-nowrap text-biz-forest-light">
              Bisa untuk semua divisi:
            </span>
            {divisions.map((division) => (
              <span
                key={division}
                className="rounded-full border border-biz-forest/10 bg-biz-mint px-3.5 py-1.5 whitespace-nowrap text-biz-forest"
              >
                {division}
              </span>
            ))}
          </div>
        </div>
      </PageMargin>
    </section>
  );
}
