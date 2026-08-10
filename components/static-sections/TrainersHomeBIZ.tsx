import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";

const trainers = [
  {
    role: "Lead Trainer",
    name: "Galih Pratama",
    image: "https://si.widyatama.ac.id/wp-content/uploads/2020/10/galih.jpg",
    bio: "10+ tahun product engineering. Membantu developer dan tim adopsi AI membangun workflow yang benar-benar dipakai.",
    tags: ["AI Workflow", "Prompting", "Vibe Coding", "Agents"],
    position: "object-[center_28%]",
  },
  {
    role: "Strategy & Leadership",
    name: "Raymond Chin",
    image: "https://assets.promediateknologi.id/crop/0x0:0x0/0x0/webp/photo/p2/108/2023/10/10/Raymond-Chin-3416706656.jpg",
    bio: "Founder Sevenpreneur. Membawakan AI strategy, business urgency, market framing, dan executive alignment.",
    tags: ["AI Strategy", "Leadership", "Executive Briefing"],
    position: "object-center",
  },
];

export default function TrainersHomeBIZ() {
  return (
    <section id="trainers" className="bg-biz-paper py-18 sm:py-28">
      <div className="mx-auto w-full max-w-315 px-4.5 sm:px-7.5">
        <SectionHeaderHomeBIZ
          eyebrow="Trainer model"
          title="Experienced people behind the practice."
          copy="Trainer kami adalah praktisi berpengalaman yang menggabungkan perspektif bisnis dan teknis, lalu menerjemahkannya menjadi latihan AI yang relevan untuk kerja tim Anda."
        />
        <div className="grid gap-4.5 lg:grid-cols-2">
          {trainers.map((trainer) => (
            <figure key={trainer.name} tabIndex={0} className="group relative h-90 overflow-hidden rounded-2xl bg-biz-forest outline-none focus-visible:ring-3 focus-visible:ring-biz-lime sm:h-95">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={trainer.image} alt={trainer.name} loading="lazy" className={`h-full w-full object-cover saturate-80 transition-[filter,transform] duration-300 group-hover:scale-[1.02] group-hover:saturate-60 group-hover:brightness-70 group-focus-visible:saturate-60 group-focus-visible:brightness-70 ${trainer.position}`} />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(1,30,22,0.12)_50%,rgba(1,30,22,0.94)_100%)]" />
              <figcaption className="absolute inset-x-0 bottom-0 z-10 translate-y-0 p-5 text-white transition-transform duration-300 sm:p-7 lg:translate-y-[calc(100%-106px)] lg:group-hover:translate-y-0 lg:group-focus-visible:translate-y-0">
                <span className="text-[10px] font-semibold tracking-[0.12em] text-biz-lime uppercase">{trainer.role}</span>
                <h3 className="mt-2.5 text-3xl leading-none font-medium tracking-[-0.05em]">{trainer.name}</h3>
                <p className="mt-3 max-w-135 text-[13px] leading-[1.6] text-white/76">{trainer.bio}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {trainer.tags.map((tag) => <span key={tag} className="rounded-full border border-white/18 bg-white/8 px-2.5 py-1 text-[9px] font-medium tracking-[0.05em] uppercase">{tag}</span>)}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
