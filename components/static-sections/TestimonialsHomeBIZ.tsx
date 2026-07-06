const testimonials = [
  {
    quote:
      "Seminggu pakai apa yang diajarin, aku otomasiin tiga hal yang dulu makan waktu seharian.",
    name: "Dina R.",
    role: "Marketing Manager · Jakarta",
    color: "bg-pink",
  },
  {
    quote:
      "Nanya jam 10 malem, tengah malem udah ada 5 yang bantu. Komunitasnya beneran hidup.",
    name: "Rudi S.",
    role: "Pemilik Usaha · Surabaya",
    color: "bg-oranye",
  },
  {
    quote:
      "Materinya nggak loncat-loncat. Dari yang takut buka ChatGPT, sekarang aku yang paling dicariin soal AI.",
    name: "Nadia K.",
    role: "Ops Lead · Bandung",
    color: "bg-hijau",
  },
];

export default function TestimonialsHomeBIZ() {
  return (
    <section className="bg-hijau-t py-22">
      <div className="mx-auto max-w-280 px-7">
        <div className="mx-auto mb-12 max-w-140 text-center">
          <span className="mb-4 inline-block text-[12.5px] font-bold uppercase tracking-wider text-[#5a8a2a]">
            Kata mereka
          </span>
          <h2 className="text-[30px] font-extrabold leading-tight md:text-[42px]">
            Orang asli. Bukan iklan.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-ink-line bg-white p-6.5"
            >
              <div className="mb-3 text-sm tracking-[2px] text-kuning">★★★★★</div>
              <p className="mb-5 text-[14.5px] leading-[1.6]">{t.quote}</p>
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex size-9.5 items-center justify-center rounded-full text-sm font-bold text-white ${t.color}`}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-[13px] font-bold">{t.name}</div>
                  <div className="text-[11.5px] text-ink-soft">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
