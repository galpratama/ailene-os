"use client";

import PageMargin from "@/components/layouts/PageMargin";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Visuals are hotlinked from multiverse.io (the reference for this section) as placeholders; replace with Ailene's own before launch.
const steps = [
  {
    title: "Petakan skill gap tim",
    description:
      "Kami asesmen tujuan bisnis dan kesiapan AI tiap divisi sebelum program dimulai.",
    image:
      "https://cdn.prod.website-files.com/69381061fef68be00431dd04/699db1e2680cb1577ce3850e_c1d7cac1cc0cc17adbbede2a5145998a5d27218f-1000x800.avif",
  },
  {
    title: "Upskill tim lewat workshop",
    description:
      "Workshop dipandu langsung per divisi, dengan use case AI yang langsung dipakai di pekerjaan harian.",
    image:
      "https://cdn.prod.website-files.com/69381061fef68be00431dd04/696762fc38852e0debc7ed24_829559251c61139e4df86bc60f7ba4c61698b9db-1000x800.avif",
  },
  {
    title: "Ukur dampaknya ke produktivitas",
    description:
      "Progress tiap peserta kelihatan di LMS, sampai tim presentasi peningkatan produktivitasnya di depan leadership.",
    image:
      "https://cdn.prod.website-files.com/69381061fef68be00431dd04/696762fb9da986a00d127ef4_9e9e0558c67020c9c7ffde439879107bb6035c3d-1000x800.avif",
  },
];

export default function SolutionHomeBIZ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  // The visual follows the last opened step, so collapsing every step doesn't blank the panel.
  const [imageIndex, setImageIndex] = useState(0);

  const toggle = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
      return;
    }
    setOpenIndex(index);
    setImageIndex(index);
  };

  return (
    <section id="solution" className="bg-biz-paper py-18 sm:py-24">
      <PageMargin>
        <div className="mb-3 flex items-center justify-center">
          <p className="biz-topic-label">The solution</p>
        </div>
        <h2 className="mx-auto max-w-250 text-center text-[36px] leading-[1.02] font-medium tracking-[-0.05em] text-biz-ink lg:text-[44px]">
          Upskill AI untuk produktivitas tim
        </h2>

        <div className="mt-12 grid gap-3 rounded-3xl border border-biz-line bg-white p-3 lg:grid-cols-2 lg:gap-14">
          {/* contain:size keeps the list out of the row's sizing, so the 4:3 photo alone sets the card height and never stretches. */}
          <ul className="divide-y divide-biz-line px-4 sm:px-6 lg:py-4 lg:pr-0 lg:pl-9 lg:[contain:size]">
            {steps.map((step, index) => {
              const open = openIndex === index;
              return (
                <li key={step.title}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`solution-step-${index}`}
                      onClick={() => toggle(index)}
                      className="group flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left lg:py-4 xl:py-5"
                    >
                      <span className="text-2xl leading-[1.2] font-medium tracking-[-0.03em] text-biz-copy decoration-1 underline-offset-[0.2em] transition-colors group-hover:text-biz-ink group-hover:underline lg:text-[clamp(1.125rem,1.75vw,1.75rem)]">
                        {step.title}
                      </span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-biz-panel-soft text-biz-ink">
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                        />
                      </span>
                    </button>
                  </h3>
                  {/* 0fr -> 1fr animates the height; inert keeps collapsed copy out of focus and screen readers. */}
                  <div
                    id={`solution-step-${index}`}
                    inert={!open}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-150 pb-6 text-base leading-[1.6] text-biz-muted lg:text-[clamp(0.9375rem,1.25vw,1.125rem)]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-biz-mint">
            {steps.map((step, index) => (
              <Image
                key={step.image}
                src={step.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className={`object-cover transition-opacity duration-500 ${imageIndex === index ? "opacity-100" : "opacity-0"}`}
              />
            ))}
          </div>
        </div>
      </PageMargin>
    </section>
  );
}
