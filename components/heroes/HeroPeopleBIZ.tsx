import Image from "next/image";
import { heroPeople, type HeroPerson } from "@/lib/biz-content";

// Static strings so Tailwind picks them up; columns 1 and 3 drift down, column 2 drifts up.
const columnAnimations = [
  "[animation:biz-marquee-y-reverse_46s_linear_infinite]",
  "[animation:biz-marquee-y_54s_linear_infinite]",
  "[animation:biz-marquee-y-reverse_50s_linear_infinite]",
];

function splitInto(count: number) {
  return Array.from({ length: count }, (_, column) =>
    heroPeople.filter((_, index) => index % count === column)
  );
}

function PersonCard({ person, hidden }: { person: HeroPerson; hidden: boolean }) {
  return (
    <article
      aria-hidden={hidden}
      className="mb-3 overflow-hidden rounded-2xl border border-biz-forest/10 bg-white shadow-[0_12px_30px_rgba(0,59,43,0.08)]"
    >
      <div className="relative aspect-square">
        <Image
          src={person.photo}
          alt={hidden ? "" : person.name}
          width={128}
          height={128}
          className="size-full object-cover"
        />
        {/* Runs past the photo edge so sub-pixel scroll offsets can't leave a hairline of photo under the name. */}
        <div className="absolute inset-x-0 -bottom-1 h-3/5 bg-linear-to-t from-white from-25% via-white/70 via-55% to-transparent" />
      </div>
      <div className="relative -mt-3 bg-white px-3 pb-3 text-center">
        <p className="text-[14px] leading-tight font-semibold tracking-[-0.02em] text-biz-ink">
          {person.name}
        </p>
        <p className="mt-1 text-[12px] leading-snug text-biz-muted">{person.role}</p>
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          <div className="rounded-lg bg-biz-mint px-1 py-1.5">
            <p className="text-[15px] leading-none font-semibold text-biz-forest-light tabular-nums">
              +{person.productivity}%
            </p>
            <p className="mt-1 text-[10px] leading-none text-biz-muted">Produktivitas</p>
          </div>
          <div className="rounded-lg bg-biz-mint px-1 py-1.5">
            <p className="text-[15px] leading-none font-semibold text-biz-forest-light tabular-nums">
              {person.aiUsage}%
            </p>
            <p className="mt-1 text-[10px] leading-none text-biz-muted">Pakai AI</p>
          </div>
        </div>
      </div>
    </article>
  );
}

function PeopleColumns({ count, className }: { count: number; className: string }) {
  return (
    <div className={`h-full gap-3 ${className}`}>
      {splitInto(count).map((people, column) => (
        <div key={column} className="min-w-0 overflow-hidden">
          <div
            className={`biz-marquee hover:[animation-play-state:paused] ${columnAnimations[column]}`}
          >
            {[...people, ...people].map((person, index) => (
              <PersonCard
                key={`${person.name}-${index}`}
                person={person}
                hidden={index >= people.length}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function HeroPeopleBIZ() {
  return (
    <div className="relative size-full">
      <div className="absolute inset-0 overflow-hidden px-4 [mask-image:linear-gradient(180deg,transparent,#000_10%,#000_88%,transparent)] sm:px-10 lg:pr-6 lg:pl-2">
        {/* Only one layout is displayed at a time, so screen readers never hear the list twice. */}
        <PeopleColumns count={2} className="grid grid-cols-2 lg:hidden" />
        <PeopleColumns count={3} className="hidden lg:grid lg:grid-cols-3" />
      </div>
    </div>
  );
}
