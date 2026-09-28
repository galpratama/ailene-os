import SectionHeaderHomeBIZ from "./SectionHeaderHomeBIZ";
import PageMargin from "@/components/layouts/PageMargin";

const trainers = [
  {
    role: "Lead Trainer",
    name: "Galih Pratama",
    image:
      "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/ailene/ChatGPTImageSep28202606_18_51AM.webp",
    bio: "10+ tahun product engineering. Membantu developer dan tim adopsi AI membangun workflow yang benar-benar dipakai.",
    tags: ["AI Workflow", "Prompting", "Vibe Coding", "Agents"],
    background: "bg-biz-lime",
  },
  {
    role: "Strategy & Leadership",
    name: "Raymond Chin",
    image:
      "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/ailene/raymondfoto.webp",
    bio: "Founder Sevenpreneur. Membawakan AI strategy, business urgency, market framing, dan executive alignment.",
    tags: ["AI Strategy", "Leadership", "Executive Briefing"],
    background: "bg-biz-forest",
  },
];

export default function TrainersHomeBIZ() {
  return (
    <section id="trainers" className="bg-biz-paper py-18 sm:py-28">
      <PageMargin>
        <SectionHeaderHomeBIZ
          eyebrow="Trainer model"
          title="Experienced people behind the practice."
          centered
        />
        <div className="mx-auto grid max-w-240 gap-4.5 sm:grid-cols-2">
          {trainers.map((trainer) => (
            <figure
              key={trainer.name}
              tabIndex={0}
              className={`group relative aspect-4/5 overflow-hidden rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-biz-lime ${trainer.background}`}
            >
              {/* Transparent 4:5 cutouts, so the card's color is the photo backdrop. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={trainer.image}
                alt={`${trainer.name}, ${trainer.role} Ailene`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-bottom transition-[filter,transform] duration-300 group-hover:scale-[1.02] group-hover:brightness-70 group-focus-visible:brightness-70"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(1,30,22,0.12)_50%,rgba(1,30,22,0.94)_100%)]" />
              <figcaption className="absolute inset-x-0 bottom-0 z-10 translate-y-0 p-5 text-white transition-transform duration-300 sm:p-7 lg:translate-y-[calc(100%-106px)] lg:group-hover:translate-y-0 lg:group-focus-visible:translate-y-0">
                <span className="text-[10px] font-semibold tracking-[0.12em] text-biz-lime uppercase">
                  {trainer.role}
                </span>
                <h3 className="mt-2.5 text-3xl leading-none font-medium tracking-[-0.05em]">
                  {trainer.name}
                </h3>
                <p className="mt-3 max-w-135 text-[13px] leading-[1.6] text-white/76">
                  {trainer.bio}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {trainer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/18 bg-white/8 px-2.5 py-1 text-[9px] font-medium tracking-[0.05em] uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </PageMargin>
    </section>
  );
}
