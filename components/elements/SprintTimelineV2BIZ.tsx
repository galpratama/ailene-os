// The 10-week Transformation Sprint bar and its phase list, on the home and on /sprint.

const weekTone = (week: number) =>
  week <= 2
    ? "bg-v2-paper-3 text-v2-ink-2"
    : week < 10
      ? "bg-v2-forest-mid text-v2-on-forest"
      : "bg-v2-forest text-v2-on-forest shadow-[inset_0_0_0_2px_var(--v2-on-forest)]";

export function SprintWeeksV2BIZ({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={className}>
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, index) => (
          <span key={index} className={`grid h-8.5 place-items-center rounded-md text-[0.68rem] font-bold sm:h-11 sm:text-[0.78rem] ${weekTone(index + 1)}`}>
            {index + 1}
          </span>
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-[2fr_8fr_1.6fr] gap-1 text-[0.8rem] font-bold text-v2-ink-3">
        <span>Ukur &amp; sepakati target</span>
        <span>Praktik di pekerjaan nyata</span>
        <span className="text-right">Demo Day</span>
      </div>
    </div>
  );
}

export function SprintPhaseListV2BIZ({ phases, className = "" }: { phases: { weeks: string; title: string; body: string }[]; className?: string }) {
  return (
    <div className={`border-t border-v2-rule ${className}`}>
      {phases.map((phase) => (
        <div key={phase.weeks} className="grid gap-1.5 border-b border-v2-rule py-6 sm:grid-cols-[160px_1fr] sm:gap-5">
          <span className="font-extrabold text-v2-green">{phase.weeks}</span>
          <div>
            <h3 className="font-jakarta text-[1.4rem] leading-tight font-extrabold tracking-[-0.025em]">{phase.title}</h3>
            <p className="mt-1.5 text-v2-ink-2">{phase.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
