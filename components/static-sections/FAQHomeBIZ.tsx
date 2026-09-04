import { faqs } from "@/lib/biz-content";

export default function FAQHomeBIZ() {
  return (
    <section id="faq" className="bg-biz-forest py-18 text-white sm:py-28">
      <div className="mx-auto grid w-full max-w-315 items-start gap-10 px-4.5 sm:px-7.5 lg:grid-cols-[minmax(280px,0.55fr)_minmax(0,1fr)] lg:gap-22.5">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] uppercase">FAQ</p>
          <h2 className="mt-3.5 text-[clamp(2.45rem,4.3vw,4.2rem)] leading-[0.94] font-medium tracking-[-0.065em]">Pertanyaan yang biasanya muncul sebelum tim kami mulai kerja.</h2>
          <p className="mt-5 max-w-140 text-[15px] leading-[1.65] text-white/62">Pilih starting point yang sesuai dengan kesiapan organisasi dan pekerjaan yang ingin digerakkan.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-biz-forest/10 bg-white text-biz-ink shadow-2xl">
          {faqs.map(({ question, answer }, index) => (
            <details key={question} open={index === 0} className="group border-b border-biz-forest/10 last:border-b-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 text-[17px] font-semibold tracking-[-0.035em] marker:hidden sm:px-7 sm:py-6 [&::-webkit-details-marker]:hidden">
                {question}
                <span className="text-2xl leading-none font-light text-biz-forest-light transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-175 px-5 pb-5 text-sm leading-[1.75] text-biz-muted sm:px-7 sm:pb-6">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
