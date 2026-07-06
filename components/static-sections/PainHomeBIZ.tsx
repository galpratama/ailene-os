const painPoints = [
  {
    emoji: "🥵",
    text: 'Tutorialnya bilang "gampang" — tapi ngira kamu udah tau apa itu API, token, sama model parameter.',
  },
  {
    emoji: "😶",
    text: 'Buka ChatGPT. Mandar di depan kolom kosong. Ngetik "halo". Terus tutup lagi.',
  },
  {
    emoji: "🌀",
    text: "Kontennya random. Loncat-loncat. Nggak ada yang ngajarin dari mana harus mulai.",
  },
  {
    emoji: "😩",
    text: "Temen kantor udah pada jago. Kamu masih di garis start, nggak tau langkah pertamanya apa.",
  },
];

export default function PainHomeBIZ() {
  return (
    <section className="bg-ink py-20 text-white">
      <div className="mx-auto max-w-205 px-7">
        <span className="mb-4 inline-block text-[12.5px] font-bold uppercase tracking-wider text-kuning">
          Familiar banget kan?
        </span>
        <h2 className="mb-10 max-w-160 text-[30px] font-extrabold leading-tight md:text-[40px]">
          Udah nonton banyak video, tapi kok masih bingung juga.
        </h2>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {painPoints.map((point) => (
            <div
              key={point.text}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-6"
            >
              <span className="mb-2.5 block text-[26px]">{point.emoji}</span>
              <p className="text-[15.5px] leading-[1.55] text-white/70">
                {point.text}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-lg font-bold">
          Itu bukan karena kamu lambat.{" "}
          <span className="text-kuning">
            Kamu cuma belum ketemu yang urutannya bener.
          </span>
        </p>
      </div>
    </section>
  );
}
