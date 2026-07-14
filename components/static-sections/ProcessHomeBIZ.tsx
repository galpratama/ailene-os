const steps = [
  {
    num: "01",
    title: "Discovery",
    desc: "Audience, objective, industri, timeline, dan constraints.",
  },
  {
    num: "02",
    title: "Pick Baseline",
    desc: "Pilih Package A, B, atau C sebagai fondasi.",
  },
  {
    num: "03",
    title: "Customize",
    desc: "Use case, contoh, tools, dan format disesuaikan.",
  },
  {
    num: "04",
    title: "Deliver",
    desc: "Lead trainer dan specialist sesuai kebutuhan.",
  },
  {
    num: "05",
    title: "Output",
    desc: "Prompt library, workflow map, action plan, atau roadmap.",
  },
];

const addOns = [
  "Executive AI Strategy",
  "AI for Marketing",
  "AI for Sales & BD",
  "AI for Finance",
  "AI for HR & People Ops",
  "AI for Operations",
  "AI Builder / Vibe Coding",
  "AI Agents & Automation",
];

export default function ProcessHomeBIZ() {
  return (
    <section className="py-19 sm:py-26">
      <div className="mx-auto w-[min(1180px,calc(100%-48px))]">
        <div className="mb-9 grid grid-cols-1 items-end gap-6 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="font-script mb-2.5 text-[34px] leading-none text-coral">
              How it works
            </div>
            <h2 className="text-[42px] leading-[1.02] font-light tracking-[-0.025em] sm:text-[clamp(38px,5vw,68px)]">
              Nggak mulai dari nol <strong className="font-bold">setiap client.</strong>
            </h2>
          </div>
          <p className="max-w-145 text-lg font-light">
            Kami mulai dari package baseline, lalu menyesuaikan contoh,
            tools, dan use case dengan industri serta objective tim.
          </p>
        </div>

        <div className="border-2 border-ink lg:flex">
          {steps.map((step, index) => (
            <div
              key={step.num}
              className={`p-6.5 lg:min-h-47.5 lg:flex-1 ${
                index !== steps.length - 1
                  ? "border-b-2 border-ink lg:border-r-2 lg:border-b-0"
                  : ""
              }`}
            >
              <div className="text-[42px] leading-none font-light text-coral">
                {step.num}
              </div>
              <h3 className="mt-5.5 mb-2 text-xl">{step.title}</h3>
              <p className="text-[13px] opacity-65">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 items-start gap-12 lg:grid-cols-[1fr_2fr]">
          <div className="bg-amber p-7 shadow-[8px_8px_0_0_var(--color-ink)]">
            <div className="font-script text-[34px] leading-none">
              Optional add-ons
            </div>
            <h3 className="mt-2.25 text-[32px] leading-[1.05]">
              Modul tambahan sesuai fungsi tim.
            </h3>
          </div>
          <div className="grid grid-cols-1 border-t-2 border-l-2 border-ink sm:grid-cols-2">
            {addOns.map((chip) => (
              <div
                key={chip}
                className="border-r-2 border-b-2 border-ink p-4.5 text-sm font-bold"
              >
                {chip}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 items-center gap-10 bg-lime-t p-9 lg:grid-cols-[1fr_auto]">
          <div>
            <h3 className="mb-2 text-[32px]">Butuh format yang lebih spesifik?</h3>
            <p className="max-w-180">
              Custom training tetap tersedia untuk executive-only session,
              technical deep dive, full online, multi-batch, atau program
              berkala.
            </p>
          </div>
          <a
            href="#contact"
            className="inline-flex min-h-12.5 items-center justify-center gap-1.5 bg-ink px-5.5 text-[13px] font-bold tracking-[0.06em] text-white uppercase transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
          >
            Bahas Custom Scope
          </a>
        </div>
      </div>
    </section>
  );
}
