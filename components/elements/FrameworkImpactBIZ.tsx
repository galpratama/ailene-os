const levels = [
  { number: "04", name: "Hasil", question: "Target tim bergerak?", implementation: "Pantau indikator yang disepakati", tone: "bg-biz-lime text-biz-forest", width: "w-[44%]" },
  { number: "03", name: "Perilaku", question: "AI dipakai di pekerjaan?", implementation: "Cek workflow saat tindak lanjut", tone: "bg-biz-mint text-biz-forest", width: "w-[60%]" },
  { number: "02", name: "Belajar", question: "Apa yang peserta kuasai?", implementation: "Lihat latihan dan asesmen", tone: "bg-biz-forest-light text-white", width: "w-[78%]" },
  { number: "01", name: "Reaksi", question: "Sesi terasa relevan?", implementation: "Kumpulkan umpan balik peserta", tone: "bg-white text-biz-forest", width: "w-full" },
] as const;

export default function FrameworkImpactBIZ() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-biz-forest-mid p-5 text-white sm:p-8">
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-white/15 pb-4">
        <span className="font-mono text-[11px] tracking-[0.13em] text-biz-lime uppercase">Piramida dampak training</span>
        <span className="font-mono text-[10px] text-white/50">KIRKPATRICK / 4 LEVEL</span>
      </div>
      <div className="relative z-10 grid items-center gap-9 pt-9 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
        <div className="relative flex min-h-97.5 flex-col items-center justify-end gap-1.5 py-4 sm:min-h-107.5">
          <div aria-hidden="true" className="absolute inset-5 rounded-full border border-white/10" />
          <div aria-hidden="true" className="absolute inset-15 rounded-full border border-white/10" />
          {levels.map((level, index) => (
            <div key={level.number} className={`biz-proof-pyramid-layer relative z-10 flex h-20 shrink-0 items-center justify-center gap-2.5 sm:h-22 ${level.width} ${level.tone}`} style={{ animationDelay: `${index * 0.65}s` }}>
              <span className="font-mono text-[11px] opacity-65">{level.number}</span>
              <span className="text-[18px] font-semibold tracking-[-0.04em] sm:text-[22px]">{level.name}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="max-w-85 text-[24px] leading-[1.08] font-medium tracking-[-0.055em] sm:text-[30px]">Yang kami lihat di tiap level.</p>
          <ol className="mt-5 grid gap-2.5">
            {levels.map((level, index) => (
              <li key={level.number} className="biz-proof-proof-row rounded-xl border border-white/15 bg-white/8 px-4 py-3" style={{ animationDelay: `${index * 0.65}s` }}>
                <p className="flex items-baseline gap-2.5 text-sm font-medium"><span className="font-mono text-[11px] text-biz-lime">{level.number}</span>{level.name}<span className="ml-auto text-right text-[13px] font-normal text-white/70">{level.question}</span></p>
                <p className="mt-1.5 pl-6.5 text-[13px] text-biz-lime/85">Di training: {level.implementation}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 text-[13px] leading-[1.6] text-white/60">Target hasil disepakati lebih dulu, lalu bukti dikumpulkan sepanjang program.</p>
        </div>
      </div>
    </div>
  );
}
