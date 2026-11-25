import { V2_SOURCE, V2_WRAP } from "@/lib/biz-home-v2";

const facts = [
  ["95%", "pilot AI di perusahaan tidak menghasilkan dampak terukur pada laba rugi.", "MIT NANDA, The GenAI Divide, 2025"],
  ["19%", "perusahaan yang benar-benar siap memanfaatkan AI.", "Cisco AI Readiness Index, 2024"],
  ["63%", "pemberi kerja menyebut kesenjangan keterampilan sebagai penghambat utama.", "WEF Future of Jobs, 2025"],
] as const;

export default function FactsV2BIZ() {
  return (
    <section aria-label="Data pendukung" className="bg-v2-paper py-[clamp(56px,7vw,96px)]">
      <div className={V2_WRAP}>
        <div className="grid border-t border-v2-rule md:grid-cols-3">
          {facts.map(([figure, claim, source], index) => (
            <div
              key={figure}
              className={`border-b border-v2-rule py-5.5 md:border-b-0 md:pt-7 md:pb-0 ${index ? "md:border-l md:border-v2-rule md:pl-6" : "md:pr-6"}`}
            >
              <b className="block font-jakarta text-[2.3rem] leading-none font-extrabold tracking-[-0.04em] tabular-nums">{figure}</b>
              <p className="mt-2.5 text-[0.98rem] text-v2-ink-2">{claim}</p>
              <p className={`${V2_SOURCE} mt-2`}>{source}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
