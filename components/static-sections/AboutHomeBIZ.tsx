import AppButton from "../buttons/AppButton";

const popCards = [
  { name: "Dina", sub: "baru kelar Foundation…", initial: "D", color: "bg-pink", className: "left-5 top-5" },
  { name: "Rudi", sub: "nanya soal prompt", initial: "R", color: "bg-hijau", className: "right-2.5 top-32.5" },
  { name: "Nadia", sub: "share tools baru 🧠", initial: "N", color: "bg-oranye", className: "bottom-5 left-10" },
];

export default function AboutHomeBIZ() {
  return (
    <section className="bg-biru-t py-22">
      <div className="mx-auto grid max-w-280 grid-cols-1 gap-14 px-7 md:grid-cols-2 md:items-center">
        <div>
          <span className="mb-4 inline-block text-[12.5px] font-bold uppercase tracking-wider text-biru">
            Kenalan dulu
          </span>
          <h2 className="mb-5 text-[30px] font-extrabold leading-tight md:text-[42px]">
            Ailene itu tempat belajar AI dari nol.
          </h2>
          <p className="mb-4 text-[17px] leading-[1.7] text-ink-soft">
            Bukan kumpulan video acak. Tapi kurikulum yang beneran runtut —
            mulai dari &ldquo;AI itu apa sih&rdquo; sampai kamu bisa pakai AI
            buat kerjaan sehari-hari.
          </p>
          <p className="mb-6 text-[17px] leading-[1.7] text-ink-soft">
            Dan kamu nggak belajar sendirian. Ada ribuan orang Indonesia yang
            lagi belajar hal yang sama, siap bantu kalau kamu stuck.
          </p>
          <AppButton variant="ink" size="cta">Lihat cara kerjanya →</AppButton>
        </div>

        <div className="relative hidden h-85 md:block">
          <svg
            className="absolute left-0 top-5 h-70 w-70"
            viewBox="0 0 280 280"
            fill="none"
          >
            <path
              d="M40,140 C40,60 140,60 140,140 C140,220 240,220 250,120"
              stroke="#7EA8F0"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>

          {popCards.map((pop) => (
            <div
              key={pop.name}
              className={`absolute flex items-center gap-2.5 rounded-2xl bg-white p-4 shadow-[0_16px_40px_-14px_rgba(23,23,26,0.28)] ${pop.className}`}
            >
              <div
                className={`flex size-9.5 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white ${pop.color}`}
              >
                {pop.initial}
              </div>
              <div>
                <div className="text-[12.5px] font-bold">{pop.name}</div>
                <div className="text-[11px] text-ink-soft">{pop.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
