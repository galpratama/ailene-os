import LinkButtonBIZ from "@/components/buttons/LinkButtonBIZ";

const summaryRows = [
  { label: "Bahasa", value: "Indonesia / English" },
  { label: "Format", value: "Offline / Hybrid" },
  { label: "Peserta", value: "Mulai 10 orang" },
  { label: "Output", value: "Workflow + Action Plan" },
];

export default function HeroHomeBIZ() {
  return (
    <header id="top" className="overflow-hidden pt-22 pb-26">
      <div className="mx-auto grid w-[min(1180px,calc(100%-48px))] grid-cols-1 items-center gap-11 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:gap-18">
        <div>
          <div className="font-script mb-2.5 text-[34px] leading-none text-coral">
            Ailene for Business
          </div>
          <h1 className="mb-7.5 text-[52px] leading-[0.93] font-light tracking-[-0.035em] sm:text-[clamp(50px,7.5vw,108px)]">
            AI training yang <strong className="font-bold">langsung kepake</strong> di
            kerjaan.
          </h1>
          <p className="max-w-170 text-lg leading-relaxed font-light sm:text-[22px]">
            Tiga package structured untuk membantu tim memahami AI, memakai
            tools dengan aman, dan menghasilkan workflow yang bisa langsung
            dipakai.
          </p>
          <div className="mt-8.5 flex flex-wrap gap-3.5">
            <LinkButtonBIZ href="#packages" variant="dark">
              Lihat Packages
            </LinkButtonBIZ>
            <LinkButtonBIZ href="#compare" variant="light">
              Bandingkan Program
            </LinkButtonBIZ>
          </div>
        </div>

        <aside
          aria-label="Ringkasan penawaran"
          className="relative mt-5 max-w-155 bg-azure p-7 pb-8 shadow-[8px_8px_0_0_var(--color-ink)] lg:mt-0 lg:max-w-none"
        >
          <span className="absolute -top-5.5 -right-5.5 hidden rotate-6 rounded-full border-2 border-ink bg-amber px-4 py-1.75 text-xs font-bold tracking-wide uppercase shadow-[4px_4px_0_0_var(--color-ink)] sm:block">
            Hands-on
          </span>
          <span className="absolute -bottom-5 -left-6.5 hidden -rotate-6 rounded-full border-2 border-ink bg-rose px-4 py-1.75 text-xs font-bold tracking-wide uppercase shadow-[4px_4px_0_0_var(--color-ink)] sm:block">
            Demo Day
          </span>
          <div className="font-script text-[44px] leading-none text-white">
            Pilih jalurnya
          </div>
          <strong className="my-4 block text-[30px] leading-tight font-bold text-white">
            Foundation, Intensive, atau Sprint.
          </strong>
          <ul className="bg-white">
            {summaryRows.map((row, index) => (
              <li
                key={row.label}
                className={`flex items-center justify-between gap-5 px-3.5 py-3 text-[13px] ${
                  index !== summaryRows.length - 1
                    ? "border-b border-gray-200"
                    : ""
                }`}
              >
                <span>{row.label}</span>
                <b className="font-bold">{row.value}</b>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </header>
  );
}
