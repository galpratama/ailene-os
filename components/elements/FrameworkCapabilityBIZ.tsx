import Image from "next/image";

const levels = [
  { number: "01", name: "AI Literacy", focus: "Pakai dengan aman", evidence: "Validasi output" },
  { number: "02", name: "Applied AI Practitioner", focus: "Workflow mandiri", evidence: "Hasil praktik" },
  { number: "03", name: "AI Systems and Decision Leader", focus: "Pimpin penerapan", evidence: "Standar tim" },
] as const;

function Core() {
  return (
    <div className="biz-proof-core relative z-10 rounded-2xl border border-biz-forest/15 bg-white p-5 shadow-[0_18px_50px_rgba(1,30,22,0.12)] sm:p-7">
      <div className="flex items-center gap-3">
        <Image src="/biz/logo-cfte.webp" alt="Logo CFTE" width={52} height={52} className="size-13 rounded-xl object-cover" />
        <div>
          <p className="font-mono text-[10px] font-semibold tracking-[0.13em] text-biz-forest-light uppercase">CFTE</p>
          <p className="text-[13px] font-medium leading-tight text-biz-muted">AI Proficiency Framework</p>
        </div>
      </div>
      <p className="mt-7 text-[27px] leading-[1.05] font-medium tracking-[-0.055em] text-biz-forest sm:text-[32px]">Peta kemampuan AI</p>
      <div className="mt-6 flex flex-wrap gap-1.5 text-[11px] font-medium text-biz-forest">
        <span className="rounded-full bg-biz-sage px-2.5 py-1">Knowledge</span>
        <span className="rounded-full bg-biz-sage px-2.5 py-1">Skills</span>
        <span className="rounded-full bg-biz-sage px-2.5 py-1">Behaviours</span>
      </div>
    </div>
  );
}

function Branch({ level, index }: { level: (typeof levels)[number]; index: number }) {
  return (
    <div className={`biz-proof-branch relative z-10 rounded-xl border p-4 shadow-[0_10px_30px_rgba(1,30,22,0.07)] sm:p-5 ${index === 2 ? "border-biz-forest-light bg-biz-lime/35" : "border-biz-line bg-white"}`} style={{ animationDelay: `${index * 0.65}s` }}>
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-biz-forest font-mono text-[10px] text-biz-lime">{level.number}</span>
        <div className="min-w-0">
          <p className="text-[15px] leading-tight font-medium tracking-[-0.035em] text-biz-forest sm:text-[17px]">{level.name}</p>
          <p className="mt-1 text-[13px] text-biz-muted">{level.focus}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-biz-forest/10 pt-2.5 text-[11px] text-biz-forest-light">
        <span className="biz-proof-node size-1.5 rounded-full bg-biz-forest-light" style={{ animationDelay: `${index * 0.65}s` }} />
        Contoh bukti: {level.evidence}
      </div>
    </div>
  );
}

export default function FrameworkCapabilityBIZ() {
  return (
    <div className="biz-proof-map relative overflow-hidden rounded-2xl border border-biz-line bg-biz-panel p-4 sm:p-6">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-biz-line pb-4">
        <span className="font-mono text-[11px] tracking-[0.13em] text-biz-forest-light uppercase">Mind map / 3 tingkat kemahiran</span>
        <span className="font-mono text-[10px] text-biz-muted">10 domain · 3 dimensi</span>
      </div>

      <div className="relative mt-5 lg:hidden">
        <div className="mx-auto max-w-78"><Core /></div>
        <div className="mx-auto h-7 w-px bg-biz-forest-light/45" aria-hidden="true" />
        <div className="relative grid gap-2.5 before:absolute before:top-0 before:bottom-0 before:left-4 before:w-px before:bg-biz-forest-light/40">
          <span className="biz-proof-mobile-traveler pointer-events-none absolute top-0 left-3 h-full w-2" aria-hidden="true"><span className="absolute top-0 left-0 size-2 rounded-full bg-biz-forest-light ring-2 ring-white" /></span>
          {levels.map((level, index) => (
            <div key={level.number} className="relative pl-8 before:absolute before:top-9 before:left-4 before:h-px before:w-4 before:bg-biz-forest-light/40">
              <Branch level={level} index={index} />
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-4 hidden h-137.5 lg:block">
        <svg viewBox="0 0 1000 550" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden="true">
          <path className="biz-proof-path" d="M 375 275 C 475 275, 470 92, 575 92" />
          <path className="biz-proof-path" d="M 375 275 C 475 275, 470 275, 575 275" />
          <path className="biz-proof-path" d="M 375 275 C 475 275, 470 458, 575 458" />
          <circle cx="375" cy="275" r="7" className="fill-biz-forest-light" />
          {[92, 275, 458].map((cy) => <circle key={cy} cx="575" cy={cy} r="5" className="fill-biz-forest-light" />)}
          <circle cx="375" cy="275" r="6" strokeWidth="2" className="biz-proof-route-dot biz-proof-route-top fill-biz-forest-light stroke-white" />
          <circle cx="375" cy="275" r="6" strokeWidth="2" className="biz-proof-route-dot biz-proof-route-middle fill-biz-forest-light stroke-white" />
          <circle cx="375" cy="275" r="6" strokeWidth="2" className="biz-proof-route-dot biz-proof-route-bottom fill-biz-forest-light stroke-white" />
        </svg>
        <div className="absolute top-1/2 left-[5%] w-[33%] -translate-y-1/2"><Core /></div>
        {levels.map((level, index) => (
          <div key={level.number} className="absolute left-[57.5%] w-[39%] -translate-y-1/2" style={{ top: `${(92 + index * 183) / 550 * 100}%` }}>
            <Branch level={level} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
}
