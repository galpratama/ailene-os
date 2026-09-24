"use client";

import { faqs } from "@/lib/biz-content";
import PageMargin from "@/components/layouts/PageMargin";
import { useState } from "react";

export default function FAQHomeBIZ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-biz-forest py-18 text-white sm:py-28">
      <PageMargin className="grid items-start gap-10 lg:grid-cols-[minmax(280px,0.55fr)_minmax(0,1fr)] lg:gap-22.5">
        <div>
          <p className="biz-topic-label !text-white before:!hidden after:!hidden">FAQ</p>
          <h2 className="mt-3.5 text-[36px] leading-[0.98] font-medium tracking-[-0.065em] text-white lg:text-[44px]">
            Pertanyaan yang biasanya muncul sebelum tim kami mulai kerja.
          </h2>
          <p className="mt-5 max-w-140 text-[15px] leading-[1.65] text-white/62">
            Pilih starting point yang sesuai dengan kesiapan organisasi dan
            pekerjaan yang ingin digerakkan.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-biz-forest/10 bg-white text-biz-ink shadow-2xl">
          {faqs.map(({ question, answer }, index) => (
            <details
              key={question}
              open={openIndex === index}
              onToggle={(event) => {
                if (event.currentTarget.open) setOpenIndex(index);
              }}
              className="group border-b border-biz-forest/10 last:border-b-0"
            >
              <summary
                onClick={(event) => {
                  event.preventDefault();
                  setOpenIndex(openIndex === index ? null : index);
                }}
                className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 text-[17px] font-semibold tracking-[-0.035em] marker:hidden sm:px-7 sm:py-6 [&::-webkit-details-marker]:hidden"
              >
                {question}
                <span className="text-2xl leading-none font-light text-biz-forest-light transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-175 px-5 pb-5 text-sm leading-[1.75] text-biz-muted sm:px-7 sm:pb-6">
                {answer}
              </p>
            </details>
          ))}
        </div>
      </PageMargin>
    </section>
  );
}
