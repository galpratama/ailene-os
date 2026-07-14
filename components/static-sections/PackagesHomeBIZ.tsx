const packages = [
  {
    no: "01",
    kicker: "Foundation Workshop",
    bg: "bg-azure",
    titlePrefix: "AI for Work",
    titleStrong: "Foundation",
    formatLine: "1 hari offline · 09:00-16:00 · hands-on lab 60-90 menit",
    modules: [
      "AI Landscape & Mindset untuk kerja sehari-hari",
      "Prompting Fundamentals dengan formula KIFF",
      "Daily Workflows Lab: email, recap, report, research, dan dokumen",
      "Hands-on practice memakai task kerja peserta",
      "Team takeaways: top use cases dan starter prompt library",
    ],
    deliverables: [
      "Prompt library starter pack",
      "Personal workflow examples",
      "Team use-case shortlist",
      "Safe-use guideline",
      "Slide deck dan workbook",
    ],
  },
  {
    no: "02",
    kicker: "Productivity Intensive",
    bg: "bg-coral",
    titlePrefix: "AI Productivity",
    titleStrong: "Intensive",
    formatLine: "2 hari · offline / hybrid · bisa split 2 half-day",
    modules: [
      "Day 1: AI business impact, prompting system, productivity workflows, dan safe usage",
      "Day 2: role-based lab untuk marketing, sales, finance, HR, ops, atau leadership",
      "Implementation clinic: mapping workflow dan prompt templates",
      "Satu use case prioritas langsung diterapkan bersama tim",
      "Follow-up clinic online tersedia 2 minggu setelah training",
    ],
    deliverables: [
      "Department AI use-case map",
      "Prompt library per role",
      "Workflow checklist",
      "Recommended AI tool stack",
      "Implementation action plan",
    ],
  },
  {
    no: "03",
    kicker: "Transformation Sprint",
    bg: "bg-rose",
    titlePrefix: "AI Transformation",
    titleStrong: "Sprint",
    formatLine: "2-3 minggu hybrid · 2-3 offline + 2-4 online · demo day",
    modules: [
      "Pre-training assessment dan stakeholder interview",
      "Executive alignment: priority, opportunity, risk, dan success metrics",
      "Team training: foundation dan role-based workflows",
      "Implementation clinic: workflow aktual, SOP update, dan prototype",
      "Demo Day dan roadmap adopsi 30/60/90 hari",
    ],
    deliverables: [
      "Company-wide AI workflow map",
      "Prompt dan template library",
      "SOP recommendations",
      "Internal champion plan",
      "Demo Day capstone",
      "30/60/90-day roadmap",
    ],
  },
];

export default function PackagesHomeBIZ() {
  return (
    <section id="packages" className="py-19 sm:py-26">
      <div className="mx-auto w-[min(1180px,calc(100%-48px))]">
        <div className="mb-9 grid grid-cols-1 items-end gap-6 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="font-script mb-2.5 text-[34px] leading-none text-coral">
              Training menu
            </div>
            <h2 className="text-[42px] leading-[1.02] font-light tracking-[-0.025em] sm:text-[clamp(38px,5vw,68px)]">
              Apa yang tim kamu <strong className="font-bold">dapatkan.</strong>
            </h2>
          </div>
          <p className="max-w-145 text-lg font-light">
            Ketiganya memakai fondasi yang sama: AI literacy, prompting,
            daily workflows, dan safety. Kedalaman serta deliverables-nya
            yang beda.
          </p>
        </div>

        <div className="grid gap-7">
          {packages.map((pkg) => (
            <article
              key={pkg.no}
              className={`grid grid-cols-1 sm:grid-cols-[150px_1fr] lg:min-h-107.5 lg:grid-cols-[240px_minmax(0,1.15fr)_minmax(300px,0.85fr)] ${pkg.bg}`}
            >
              <div className="flex flex-col justify-between border-b-2 border-ink/16 p-6 sm:border-b-0 sm:border-r-2 lg:p-10">
                <div className="text-[50px] leading-[0.9] font-light text-white lg:text-[76px]">
                  {pkg.no}
                </div>
                <div className="font-script text-[30px] leading-tight text-ink">
                  {pkg.kicker}
                </div>
              </div>

              <div className="p-7 sm:p-9">
                <h3 className="mb-4 text-[31px] leading-tight font-light lg:text-[38px]">
                  {pkg.titlePrefix}{" "}
                  <strong className="font-bold">{pkg.titleStrong}</strong>
                </h3>
                <div className="mb-5.5 inline-block bg-white px-2.5 py-1.75 text-[11px] font-bold tracking-[0.05em] uppercase">
                  {pkg.formatLine}
                </div>
                <ul className="list-none p-0">
                  {pkg.modules.map((module, index) => (
                    <li
                      key={module}
                      className={`py-2.5 text-sm ${
                        index !== pkg.modules.length - 1
                          ? "border-b border-ink/18"
                          : ""
                      }`}
                    >
                      {module}
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="col-span-full m-4 flex flex-col self-stretch bg-white p-5 sm:col-auto sm:m-6 lg:p-6">
                <div className="mb-2.5 text-[11px] font-bold tracking-[0.08em] uppercase">
                  Output
                </div>
                <ul className="mb-4.5 list-none p-0">
                  {pkg.deliverables.map((item) => (
                    <li
                      key={item}
                      className="border-b border-gray-200 py-1.75 text-[13px] before:mr-2.25 before:font-bold before:content-['✓']"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto border-t-2 border-ink/15 pt-5">
                  <a
                    href="#contact"
                    className="flex min-h-12.5 w-full items-center justify-center gap-1.5 bg-ink px-5.5 text-[13px] font-bold tracking-[0.06em] text-white uppercase transition-[filter,transform] hover:brightness-110 active:scale-[0.98]"
                  >
                    Talk to a Consultant
                  </a>
                  <small className="mt-2.5 block leading-relaxed text-[#4f5353]">
                    Scope program disesuaikan dengan objective, peserta, dan
                    output yang dibutuhkan.
                  </small>
                </div>
              </aside>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
