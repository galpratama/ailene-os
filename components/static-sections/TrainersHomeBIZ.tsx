const trainers = [
  {
    role: "Lead Trainer",
    name: "Galih Pratama",
    bio: "Full-stack engineer dan AI educator untuk practical AI workflow, prompting, vibe coding, AI agents, dan hands-on implementation.",
    tags: ["AI Workflow", "Prompting", "Vibe Coding", "Agents"],
    shadow: "shadow-[8px_8px_0_0_var(--color-azure)]",
  },
  {
    role: "Strategy & Leadership",
    name: "Raymond Chin",
    bio: "Founder Sevenpreneur. Membawakan AI strategy, business urgency, market framing, dan executive alignment.",
    tags: ["AI Strategy", "Leadership", "Executive Briefing"],
    shadow: "shadow-[8px_8px_0_0_var(--color-coral)]",
  },
  {
    role: "Specialist Bench",
    name: "Trainer Pool",
    bio: "Trainer spesialis marketing, sales, finance, HR, operations, automation, dan tech dengan standardisasi materi Ailene.",
    tags: ["Marketing", "Sales", "Finance", "HR", "Automation"],
    shadow: "shadow-[8px_8px_0_0_var(--color-lime)]",
  },
];

export default function TrainersHomeBIZ() {
  return (
    <section id="trainers" className="bg-charcoal py-19 text-white sm:py-26">
      <div className="mx-auto w-[min(1180px,calc(100%-48px))]">
        <div className="mb-9 grid grid-cols-1 items-end gap-6 lg:grid-cols-2 lg:gap-20">
          <div>
            <div className="font-script mb-2.5 text-[34px] leading-none text-rose">
              Trainer model
            </div>
            <h2 className="text-[42px] leading-[1.02] font-light tracking-[-0.025em] sm:text-[clamp(38px,5vw,68px)]">
              Core trainer dan <strong className="font-bold">specialist bench.</strong>
            </h2>
          </div>
          <p className="max-w-145 text-lg font-light">
            Lead trainer membawakan fondasi. Specialist masuk untuk
            role-based lab, leadership, automation, atau technical deep dive.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {trainers.map((trainer) => (
            <article
              key={trainer.name}
              className={`min-h-77.5 bg-white p-7 text-ink ${trainer.shadow}`}
            >
              <div className="text-[11px] font-bold tracking-[0.08em] text-ink opacity-50 uppercase">
                {trainer.role}
              </div>
              <h3 className="my-3 text-[29px]">{trainer.name}</h3>
              <p className="text-sm">{trainer.bio}</p>
              <div className="mt-4.5 flex flex-wrap gap-1.75">
                {trainer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 px-2 py-1.25 text-[10px] font-bold tracking-[0.05em] uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
