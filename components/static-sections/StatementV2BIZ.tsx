"use client";

import { useScrollFrame } from "@/hooks/useScrollFrame";
import { V2_WRAP } from "@/lib/biz-home-v2";
import Image from "next/image";
import { useRef } from "react";

const STATEMENT =
  "95 dari 100 pilot AI tidak berdampak pada laba rugi. Bukan karena AI-nya kurang canggih. Karena cara kerja timnya tidak pernah berubah.";
const words = STATEMENT.split(" ");

// Small tool marks and two people sit near the statement on wide screens.
const decorations = [
  { kind: "tool", name: "Gemini", src: "/biz/v2/icons/gemini.png", speed: -0.06, tilt: -14, delay: "-0.7s", className: "left-[4%] top-[9%] size-20" },
  { kind: "person", name: "Galih Pratama", src: "/biz/v2/team-galih.webp", speed: 0.08, className: "right-[4%] top-[7%] size-25" },
  { kind: "tool", name: "ChatGPT", src: "/biz/v2/icons/chatgpt.png", speed: -0.04, tilt: 10, delay: "-2.4s", className: "left-[1%] top-[43%] size-20" },
  { kind: "tool", name: "Copilot", src: "/biz/v2/icons/copilot.png", speed: 0.07, tilt: -11, delay: "-1.5s", className: "right-[1%] top-[46%] size-20" },
  { kind: "person", name: "Raymond Chin", src: "/biz/photos/trainer-raymond.webp", speed: -0.08, className: "left-[6%] bottom-[6%] size-25" },
  { kind: "tool", name: "Claude", src: "/biz/v2/icons/claude.png", speed: 0.05, tilt: 13, delay: "-3.1s", className: "right-[6%] bottom-[7%] size-20" },
] as const;

export default function StatementV2BIZ() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const decorationRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Words fill from 16% to full ink as the heading passes the reading line.
  useScrollFrame(sectionRef, (rect, vh) => {
    const heading = headingRef.current;
    if (!heading) return;
    const progress = Math.min(1, Math.max(0, (vh * 0.82 - heading.getBoundingClientRect().top) / (vh * 0.5)));
    const filled = progress * words.length;
    heading.querySelectorAll<HTMLElement>("[data-word]").forEach((word, index) => {
      word.style.opacity = (0.16 + 0.84 * Math.min(1, Math.max(0, filled - index))).toFixed(3);
    });
    const drift = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height))) - 0.5;
    decorationRefs.current.forEach((decoration, index) => {
      if (decoration) decoration.style.transform = `translate3d(0,${(drift * decorations[index].speed * 900).toFixed(1)}px,0)`;
    });
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="v2-statement"
      className="relative overflow-hidden bg-v2-paper py-[clamp(80px,14vw,120px)] min-[1000px]:py-[clamp(96px,8vw,124px)] 2xl:py-28"
    >
      <div aria-hidden="true" className="absolute inset-0 mx-auto hidden max-w-285 min-[1000px]:block">
        {decorations.map((decoration, index) => (
          <div
            key={decoration.name}
            ref={(element) => {
              decorationRefs.current[index] = element;
            }}
            className={`v2-scrub pointer-events-none absolute ${decoration.kind === "person" ? "overflow-hidden rounded-2xl shadow-[0_24px_48px_-26px_rgb(10_32_22/0.35)]" : ""} ${decoration.className}`}
          >
            {decoration.kind === "person" ? (
              <div className="relative size-full bg-linear-to-br from-v2-lime to-v2-leaf">
                <Image src={decoration.src} fill sizes="100px" alt="" loading="lazy" className="object-cover object-top" />
              </div>
            ) : (
              <div className="size-full" style={{ transform: `rotate(${decoration.tilt}deg)` }}>
                <div className="v2-tool-float flex size-full items-center justify-center" style={{ animationDelay: decoration.delay }}>
                  <Image src={decoration.src} width={68} height={68} alt="" loading="lazy" className={`size-17 object-contain ${decoration.name === "ChatGPT" ? "mix-blend-multiply" : "drop-shadow-[0_10px_12px_rgb(10_32_22/0.16)]"} ${decoration.name === "Copilot" ? "scale-125" : ""} ${decoration.name === "Claude" ? "rounded-xl" : ""}`} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={V2_WRAP}>
        <h2
          id="v2-statement"
          ref={headingRef}
          className="relative z-1 mx-auto max-w-[21ch] text-center font-jakarta text-[clamp(2rem,4.4vw,3.9rem)] leading-[1.1] font-extrabold tracking-[-0.035em] text-v2-ink"
        >
          {words.map((word, index) => (
            <span key={index}>
              <span data-word>{word}</span>
              {index < words.length - 1 ? " " : null}
            </span>
          ))}
        </h2>
        <p className="relative z-1 mt-6 text-center">
          <a href="#board" className="inline-flex min-h-11 items-center font-bold text-v2-green underline decoration-v2-green/40 underline-offset-[0.25em] hover:decoration-v2-green">
            Lihat contoh Rapor AI
          </a>
        </p>
      </div>
    </section>
  );
}
