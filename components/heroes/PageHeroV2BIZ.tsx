import { V2_LEAD, V2_WRAP } from "@/lib/biz-home-v2";
import HeroGlowV2BIZ from "@/components/heroes/HeroGlowV2BIZ";
import type { ReactNode } from "react";

// Hero of the v2 secondary pages (sprint, academy, governance): the home's green, quieter.
export default function PageHeroV2BIZ({
  id,
  crumb,
  title,
  lead,
  actions,
  aside,
  tone = "paper",
}: {
  id: string;
  crumb?: { href: string; label: string; current: string };
  title: string;
  lead: ReactNode;
  actions?: ReactNode;
  aside?: ReactNode;
  tone?: "paper" | "paper-2";
}) {
  return (
    <section
      aria-labelledby={id}
      className={`relative isolate overflow-hidden pt-[clamp(56px,8vw,112px)] pb-[clamp(48px,6vw,80px)] ${
        tone === "paper" ? "bg-v2-paper" : "bg-v2-paper-2"
      }`}
    >
      <HeroGlowV2BIZ />
      <div
        className={`${V2_WRAP} ${aside ? "grid items-center gap-[clamp(32px,5vw,72px)] min-[900px]:grid-cols-[5fr_7fr]" : ""}`}
      >
        <div className={aside ? "" : "max-w-190"}>
          {crumb && (
            <p className="mb-7 flex items-center gap-2 text-[0.88rem] font-semibold text-v2-ink-2">
              <a href={crumb.href} className="hover:text-v2-ink">
                {crumb.label}
              </a>
              <span aria-hidden="true">/</span>
              <span>{crumb.current}</span>
            </p>
          )}
          <h1
            id={id}
            className="font-jakarta text-[clamp(2.15rem,4.6vw,3.6rem)] leading-[1.04] font-extrabold tracking-[-0.035em] text-balance"
          >
            {title}
          </h1>
          <p className={`${V2_LEAD} mt-5`}>{lead}</p>
          {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
        {aside}
      </div>
    </section>
  );
}
