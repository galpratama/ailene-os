import { LogoAilene } from "@/components/svg/LogoAilene";

const columns = [
  {
    title: "Explore",
    links: [["Program formats", "#programs"], ["How We Work", "#how-we-work"], ["FAQ", "#faq"]],
  },
  {
    title: "Programs",
    links: [["Foundation", "#programs"], ["Intensive", "#programs"], ["Sprint", "#programs"]],
  },
  {
    title: "Start a conversation",
    links: [["Book a Discovery Call", "https://wa.me/6285110545698"], ["Custom AI Adoption Program", "#programs"]],
  },
];

export default function FooterHomeBIZ() {
  return (
    <footer className="bg-[linear-gradient(180deg,var(--color-biz-forest)_0%,var(--color-biz-forest-mid)_100%)] pt-13.5 pb-6 text-white">
      <div className="mx-auto grid w-full max-w-315 gap-10 px-4.5 sm:px-7.5 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <LogoAilene className="h-8 w-auto" />
          <p className="mt-5 max-w-100 text-sm leading-[1.8] text-white/65">Membantu organisasi bergerak dari AI training menuju adopsi yang terlihat, terukur, dan berlanjut di pekerjaan sehari-hari.</p>
          <p className="mt-4"><a href="https://wa.me/6285110545698" target="_blank" rel="noreferrer" className="text-sm font-medium text-biz-lime hover:text-white">Diskusikan Kebutuhan Tim</a></p>
        </div>
        <div className="grid grid-cols-2 gap-7 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-mono text-[10px] tracking-[0.2em] text-white/42 uppercase">{column.title}</h3>
              {column.links.map(([label, href]) => <a key={label} href={href} className="mt-3 block text-[13px] text-white/68 transition-colors hover:text-white">{label}</a>)}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-13 flex w-full max-w-315 flex-col justify-between gap-3 border-t border-white/15 px-4.5 pt-5.5 text-xs text-white/45 sm:flex-row sm:px-7.5">
        <span>© 2026 Ailene. All rights reserved.</span>
        <span>AI adoption training for organizations</span>
      </div>
    </footer>
  );
}
