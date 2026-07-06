const classes = [
  {
    tag: "Modul 01",
    title: "Kenalan sama AI",
    desc: "Apa itu AI, gimana cara kerjanya, dan kenapa nggak seserem yang kamu kira.",
    bg: "bg-kuning-t",
    tagText: "text-[#9a7a1a]",
    accent: "bg-kuning",
    lines: ["w-4/5", "w-full", "w-3/5", "w-11/12"],
  },
  {
    tag: "Modul 03",
    title: "Prompting 101",
    desc: "Cara nanya ke AI biar jawabannya spesifik dan langsung kepake.",
    bg: "bg-biru-t",
    tagText: "text-[#3a68b0]",
    accent: "bg-biru",
    lines: ["w-[70%]", "w-[95%]", "w-full", "w-1/2"],
  },
  {
    tag: "Modul 04",
    title: "AI di Dunia Kerja",
    desc: "Contoh nyata pakai AI buat marketing, HR, sales, sampai operasional.",
    bg: "bg-hijau-t",
    tagText: "text-[#5a8a2a]",
    accent: "bg-hijau",
    lines: ["w-11/12", "w-2/3", "w-full", "w-3/4"],
  },
];

export default function ClassesHomeBIZ() {
  return (
    <section className="bg-white py-22">
      <div className="mx-auto max-w-280 px-7">
        <div className="mx-auto mb-12 max-w-150 text-center">
          <span className="mb-4 inline-block text-[12.5px] font-bold uppercase tracking-wider text-hijau">
            Isi kelasnya
          </span>
          <h2 className="mb-4 text-[30px] font-extrabold leading-tight md:text-[42px]">
            Materinya jelas, nggak bikin puyeng.
          </h2>
          <p className="text-[17px] leading-[1.65] text-ink-soft">
            Tiap modul dirancang biar gampang diikutin — bahkan kalau kamu
            belum pernah nyentuh AI sama sekali.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {classes.map((cls) => (
            <div
              key={cls.tag}
              className="overflow-hidden rounded-2xl border border-ink-line bg-white transition-transform hover:-translate-y-1"
            >
              <div className={`relative flex h-37.5 items-end justify-center ${cls.bg}`}>
                <div className="w-[82%] rounded-t-lg bg-white p-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                  <div className="mb-2 flex gap-1">
                    <span className="size-1.75 rounded-full bg-ink-line" />
                    <span className="size-1.75 rounded-full bg-ink-line" />
                    <span className="size-1.75 rounded-full bg-ink-line" />
                  </div>
                  {cls.lines.map((width, i) => (
                    <div
                      key={i}
                      className={`mb-1.5 h-1.5 rounded-full ${width} ${
                        i === 2 ? cls.accent : "bg-off"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="px-5 pb-5 pt-4">
                <span
                  className={`mb-2.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls.bg} ${cls.tagText}`}
                >
                  {cls.tag}
                </span>
                <div className="mb-1 text-[17px] font-extrabold">{cls.title}</div>
                <div className="text-[13.5px] leading-normal text-ink-soft">
                  {cls.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
