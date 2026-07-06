const benefits = [
  {
    icon: "⚡",
    bg: "bg-kuning-t",
    title: "Kerja jadi jauh lebih cepat",
    desc: "Kerjaan yang biasa makan 2 jam, kelar dalam 20 menit.",
  },
  {
    icon: "🏆",
    bg: "bg-biru-t",
    title: "Sertifikat tiap kelar level",
    desc: "Bukti belajar yang bisa kamu pajang di LinkedIn atau CV.",
  },
  {
    icon: "📈",
    bg: "bg-pink-t",
    title: "Naik level yang bisa di-flexing",
    desc: "Tiap progres kebuka badge baru. Pamerin ke temen kantor.",
  },
  {
    icon: "🏅",
    bg: "bg-hijau-t",
    title: "Leaderboard komunitas",
    desc: "Lihat posisimu di antara ribuan learner lain. Bikin nagih.",
  },
];

export default function BenefitHomeBIZ() {
  return (
    <section className="bg-white py-22">
      <div className="mx-auto grid max-w-280 grid-cols-1 gap-14 px-7 md:grid-cols-2 md:items-center">
        <div>
          <span className="mb-4 inline-block text-[12.5px] font-bold uppercase tracking-wider text-kuning">
            Yang kamu dapet
          </span>
          <h2 className="mb-7 text-[30px] font-extrabold leading-tight md:text-[42px]">
            Bukan cuma ilmu. Ada yang bisa kamu banggain.
          </h2>
          <div className="flex flex-col gap-[18px]">
            {benefits.map((b) => (
              <div key={b.title} className="flex items-start gap-3.5">
                <div
                  className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-[15px] ${b.bg}`}
                >
                  {b.icon}
                </div>
                <div>
                  <div className="mb-0.5 text-base font-bold">{b.title}</div>
                  <div className="text-sm leading-normal text-ink-soft">
                    {b.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden h-100 items-center justify-center md:flex">
          <div className="absolute w-57.5 translate-x-10 -translate-y-5 rotate-6 rounded-2xl bg-white p-5 opacity-90 shadow-[0_20px_50px_-16px_rgba(23,23,26,0.3)]">
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-biru-t text-3xl">
              📜
            </div>
            <div className="mb-1 text-center text-[11px] font-bold uppercase tracking-wider text-ink-soft">
              Sertifikat
            </div>
            <div className="mb-2 text-center text-[17px] font-extrabold">
              Foundation Complete
            </div>
            <div className="text-center text-xs text-ink-soft">
              Diselesaikan 12 Agustus 2026
            </div>
          </div>

          <div className="relative w-57.5 rotate-[-4deg] rounded-2xl bg-white p-5 shadow-[0_20px_50px_-16px_rgba(23,23,26,0.3)]">
            <div className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-kuning-t text-3xl">
              🔥
            </div>
            <div className="mb-1 text-center text-[11px] font-bold uppercase tracking-wider text-ink-soft">
              Level 3 · Rank #47
            </div>
            <div className="mb-2 text-center text-[17px] font-extrabold">
              Nadia K.
            </div>
            <div className="text-center text-xs text-ink-soft">
              2.480 XP · streak 12 hari 🔥
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-off">
              <div className="h-full w-[72%] rounded-full bg-kuning" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
