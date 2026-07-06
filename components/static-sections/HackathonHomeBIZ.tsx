import AppButton from "../buttons/AppButton";

export default function HackathonHomeBIZ() {
  return (
    <section className="bg-white py-22">
      <div className="mx-auto max-w-280 px-7">
        <div className="relative grid grid-cols-1 items-center gap-12 overflow-hidden rounded-3xl bg-ink p-12 md:grid-cols-[1fr_auto]">
          <span className="absolute -top-5 right-30 size-17.5 rounded-full bg-oranye opacity-90" />
          <span className="absolute bottom-5 right-50 size-11 rounded-full bg-pink" />

          <div className="relative z-10">
            <div className="mb-4.5 inline-flex items-center gap-1.5 rounded-full bg-oranye px-3.25 py-1.25 text-[11.5px] font-bold uppercase tracking-wider text-white">
              🔥 Akhir tahun ini
            </div>
            <h2 className="mb-2.5 text-2xl font-extrabold text-white md:text-[32px]">
              Event AI terbesar di Indonesia.
            </h2>
            <p className="mb-6 max-w-110 text-[15px] leading-[1.6] text-white/65">
              Kolaborasi bareng nama-nama besar dan perusahaan terkemuka. Satu
              tantangan: siapa yang bisa bikin AI tools paling berguna?
            </p>
            <div className="mb-7 flex flex-wrap gap-5.5">
              <div className="text-[13px] text-white/50">
                <strong className="font-semibold text-white">Desember 2026</strong>{" "}
                · Jakarta
              </div>
              <div className="text-[13px] text-white/50">
                <strong className="font-semibold text-white">48 jam</strong>{" "}
                nonstop
              </div>
            </div>
            <AppButton variant="orange" size="cta">See detail →</AppButton>
          </div>

          <div className="relative z-10 hidden text-center md:block">
            <div className="text-[88px] font-extrabold leading-none tracking-tight text-oranye">
              48
            </div>
            <div className="text-xs font-bold uppercase tracking-[0.1em] text-white/40">
              JAM
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
