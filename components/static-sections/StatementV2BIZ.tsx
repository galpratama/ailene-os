"use client";

import { useScrollFrame } from "@/hooks/useScrollFrame";
import { V2_WRAP } from "@/lib/biz-home-v2";
import Image from "next/image";
import { useRef } from "react";

const STATEMENT =
  "95 dari 100 pilot AI tidak berdampak pada laba rugi. Bukan karena AI-nya kurang canggih. Karena cara kerja timnya tidak pernah berubah.";
const words = STATEMENT.split(" ");

// Photos drift at their own speed around the statement; hidden below 1000px.
const photos = [
  { src: "/biz/v2/demoday-winners.webp", w: 760, h: 570, speed: -0.18, className: "left-[3%] top-[9%] w-[min(15vw,220px)] aspect-4/3" },
  { src: "/biz/v2/team-galih.webp", w: 640, h: 560, speed: 0.12, className: "right-[5%] top-[7%] w-[min(10vw,150px)] aspect-square" },
  { src: "/biz/v2/session-group.webp", w: 771, h: 717, speed: -0.08, className: "left-[7%] bottom-[9%] w-[min(11vw,170px)] aspect-square" },
  { src: "/biz/v2/demoday-present.webp", w: 760, h: 570, speed: 0.2, className: "right-[3%] bottom-[13%] w-[min(16vw,230px)] aspect-4/3" },
  { src: "/biz/v2/session-speaker.webp", w: 767, h: 717, speed: -0.14, className: "left-1/2 bottom-[2.5%] -ml-13.75 w-[min(8vw,110px)] aspect-square" },
];

export default function StatementV2BIZ() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);

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
    photoRefs.current.forEach((photo, index) => {
      if (photo) photo.style.transform = `translate3d(0,${(drift * photos[index].speed * 900).toFixed(1)}px,0)`;
    });
  });

  return (
    <section
      ref={sectionRef}
      aria-labelledby="v2-statement"
      className="relative overflow-hidden bg-v2-paper py-[clamp(80px,14vw,120px)] min-[1000px]:py-[clamp(120px,17vw,240px)]"
    >
      <div aria-hidden="true" className="hidden min-[1000px]:block">
        {photos.map((photo, index) => (
          <div
            key={photo.src}
            ref={(element) => {
              photoRefs.current[index] = element;
            }}
            className={`v2-scrub absolute overflow-hidden rounded-xl shadow-[0_30px_60px_-30px_rgb(10_32_22/0.45)] ${photo.className}`}
          >
            <Image src={photo.src} width={photo.w} height={photo.h} alt="" loading="lazy" className="size-full object-cover" />
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
