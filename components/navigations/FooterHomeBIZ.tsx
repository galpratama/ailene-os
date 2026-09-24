"use client";

import { LogoAilene } from "@/components/svg/LogoAilene";
import { trackCTAClick } from "@/lib/conversion";
import PageMargin from "@/components/layouts/PageMargin";

const columns = [
  {
    title: "Explore",
    links: [
      ["Program formats", "#programs"],
      ["How We Work", "#how-we-work"],
      ["FAQ", "#faq"],
    ],
  },
  {
    title: "Programs",
    links: [
      ["Foundation", "#programs"],
      ["Intensive", "#programs"],
      ["Sprint", "#programs"],
    ],
  },
  {
    title: "Start a conversation",
    links: [
      ["Book Meeting", "#contact"],
      ["Custom AI Adoption Program", "#programs"],
    ],
  },
];

export default function FooterHomeBIZ() {
  return (
    <footer className="bg-black pt-13.5 pb-6 text-white">
      <PageMargin className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <div>
          <LogoAilene variant="white" className="h-8 w-auto" />
          <p className="mt-5 max-w-100 text-sm leading-[1.8] text-white/65">
            Membantu organisasi bergerak dari AI training menuju adopsi yang
            terlihat, terukur, dan berlanjut di pekerjaan sehari-hari.
          </p>
          <p className="mt-4">
            <a
              href="#contact"
              onClick={() => trackCTAClick({ placement: "footer" })}
              className="text-sm font-medium text-biz-lime hover:text-white"
            >
              Book Meeting
            </a>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-7 sm:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="font-mono text-[10px] tracking-[0.2em] text-white/42 uppercase">
                {column.title}
              </h3>
              {column.links.map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={
                    href === "#contact"
                      ? () => trackCTAClick({ placement: "footer_nav" })
                      : undefined
                  }
                  className="mt-3 block text-[15px] text-white/68 transition-colors hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </PageMargin>
      <PageMargin className="mt-13 flex flex-col justify-between gap-3 border-t border-white/15 pt-5.5 text-xs text-white/45 sm:flex-row">
        <span>© 2026 Ailene. All rights reserved.</span>
        <span>AI adoption training for organizations</span>
      </PageMargin>
    </footer>
  );
}
