const rootModules = [
  "01 · Kenalan sama AI",
  "02 · Cara AI Berpikir",
  "03 · Prompting 101",
  "04 · AI di Dunia Kerja",
  "05 · Tools AI",
  "06 · Aman & Bijak",
  "07 · Pilih Jalurmu",
];

const rootMeta = [
  { icon: "📚", label: "Materi + kurikulum" },
  { icon: "⏱", label: "~3,5 jam" },
  { icon: "🎓", label: "Sertifikat" },
];

const branches = [
  {
    icon: "🎮",
    bg: "bg-biru-t",
    title: "Kuasai Tools AI",
    via: "via KelasClaude",
    desc: "Workflow siap pakai per profesi — Claude, ChatGPT, Gemini buat kerjaan sehari-hari.",
  },
  {
    icon: "💻",
    bg: "bg-pink-t",
    title: "Bikin Tools Sendiri",
    via: "via BelajarVibeCoding",
    desc: "Bikin aplikasi kerja sendiri tanpa nulis kode. Tanpa pusing, semua dari AI.",
  },
  {
    icon: "🤖",
    bg: "bg-oranye-t",
    title: "Bikin AI Agent",
    via: "via JagoHermes",
    desc: "AI yang kerja otomatis tanpa disuruh. Jalan bahkan waktu kamu nggak di depan laptop.",
  },
];

export default function SkillTreeHomeBIZ() {
  return (
    <section className="bg-off py-22">
      <div className="mx-auto max-w-280 px-7">
        <div className="mx-auto mb-12 max-w-150 text-center">
          <span className="mb-4 inline-block text-[12.5px] font-bold uppercase tracking-wider text-oranye">
            Jalur belajarnya
          </span>
          <h2 className="mb-4 text-[30px] font-extrabold leading-tight md:text-[42px]">
            Mulai dari satu akar. Cabang sesuai kebutuhanmu.
          </h2>
          <p className="text-[17px] leading-[1.65] text-ink-soft">
            Semua orang mulai dari Foundation. Habis itu, tinggal pilih mau
            dalemin yang mana.
          </p>
        </div>

        <div className="mx-auto max-w-140 rounded-[22px] bg-ink px-9 py-8 text-center text-white">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/[0.14] px-3.5 py-1 text-xs font-bold">
            🌱 Mulai di sini
          </div>
          <h3 className="mb-2 text-2xl font-extrabold">Ailene Foundation</h3>
          <p className="mx-auto mb-5 max-w-105 text-[14.5px] leading-[1.55] text-white/70">
            Semua fundamental AI yang jarang dijelasin orang. Dari &ldquo;AI
            itu apa&rdquo; sampai bisa dipake beneran di kerjaan. No coding,
            no matematika.
          </p>
          <div className="mb-5 flex flex-wrap justify-center gap-1.5">
            {rootModules.map((mod) => (
              <span
                key={mod}
                className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/85"
              >
                {mod}
              </span>
            ))}
          </div>
          <div className="flex justify-center gap-4.5 border-t border-white/[0.14] pt-4">
            {rootMeta.map((meta) => (
              <span key={meta.label} className="text-[12.5px] text-white/60">
                {meta.icon}{" "}
                <strong className="font-semibold text-white">{meta.label}</strong>
              </span>
            ))}
          </div>
        </div>

        <div className="py-6 text-center">
          <div className="mx-auto h-8 w-0.5 bg-ink-line" />
          <div className="mt-2 text-[13px] font-bold text-ink-soft">
            Udah kelar Foundation? Pilih jalurmu ↓
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {branches.map((branch) => (
            <div
              key={branch.title}
              className="rounded-2xl border border-ink-line bg-white p-6"
            >
              <div
                className={`mb-3.5 flex size-11 items-center justify-center rounded-xl text-[22px] ${branch.bg}`}
              >
                {branch.icon}
              </div>
              <h4 className="text-[17px] font-extrabold">{branch.title}</h4>
              <div className="mb-2.5 text-[11.5px] text-ink-soft/70">
                {branch.via}
              </div>
              <p className="text-[13.5px] leading-[1.55] text-ink-soft">
                {branch.desc}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-[14.5px] text-ink-soft">
          Cobain semua materi dulu. Kalau udah ngerasa butuh yang lebih dalam,
          tinggal lanjut.
        </p>
      </div>
    </section>
  );
}
