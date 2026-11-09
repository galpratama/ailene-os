import { Check, MoveRight } from "lucide-react";

const steps = [
  { number: "01", when: "SEBELUM", title: "Titik awal terlihat", proof: "Survei & target peran" },
  { number: "02", when: "SAAT KELAS", title: "Kemampuan dipraktikkan", proof: "Hasil tugas nyata" },
  { number: "03", when: "SESUDAH", title: "Penerapan ditinjau", proof: "Follow-up & indikator" },
] as const;

function MiniVisual({ index }: { index: number }) {
  if (index === 0) {
    return <div className="flex h-26 items-end gap-3 rounded-xl bg-biz-sage p-4" aria-hidden="true">
      {["h-7", "h-13", "h-19", "h-12", "h-16"].map((height, item) => <span key={item} className={`biz-proof-mini-bar w-full origin-bottom rounded-t bg-biz-forest-light/65 ${height}`} style={{ animationDelay: `${item * 0.3}s` }} />)}
    </div>;
  }
  if (index === 1) {
    return <div className="flex h-26 items-center justify-center gap-2 rounded-xl bg-biz-forest p-4 text-biz-lime" aria-hidden="true">
      <span className="biz-proof-mini-tile grid size-12 place-items-center rounded-lg border border-biz-lime/45 bg-biz-lime/10 font-mono text-xs">AI</span>
      <MoveRight size={24} strokeWidth={1.5} />
      <span className="biz-proof-mini-tile grid size-12 place-items-center rounded-lg bg-biz-lime text-biz-forest" style={{ animationDelay: "0.6s" }}><Check size={21} /></span>
    </div>;
  }
  return <div className="grid h-26 gap-2 rounded-xl bg-biz-sage p-4" aria-hidden="true">
    {[0, 1, 2].map((item) => <span key={item} className="flex items-center gap-2"><span className="biz-proof-node size-3 rounded-full bg-biz-forest-light" style={{ animationDelay: `${item * 0.5}s` }} /><span className="h-1.5 w-full rounded-full bg-biz-forest-light/20" /></span>)}
  </div>;
}

export default function FrameworkEvidenceBIZ() {
  return (
    <ol className="grid gap-3 sm:grid-cols-3" aria-label="Jejak bukti yang dicari dalam program Ailene">
      {steps.map((step, index) => (
        <li key={step.number} className="rounded-2xl border border-biz-line bg-white p-4 sm:p-5">
          <MiniVisual index={index} />
          <div className="mt-5 flex items-center justify-between gap-3 font-mono text-[10px] font-semibold tracking-[0.13em] text-biz-forest-light">
            <span>{step.when}</span><span>{step.number}</span>
          </div>
          <h3 className="mt-2 text-xl leading-tight font-medium tracking-[-0.045em] text-biz-forest">{step.title}</h3>
          <p className="mt-1 text-[13px] text-biz-muted">{step.proof}</p>
        </li>
      ))}
    </ol>
  );
}
