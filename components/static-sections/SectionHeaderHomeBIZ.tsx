import type { ReactNode } from "react";

interface SectionHeaderHomeBIZProps {
  eyebrow: string;
  title: ReactNode;
  copy: string;
  centered?: boolean;
  dark?: boolean;
  className?: string;
}

export default function SectionHeaderHomeBIZ({
  eyebrow,
  title,
  copy,
  centered = false,
  dark = false,
  className,
}: SectionHeaderHomeBIZProps) {
  if (centered) {
    return (
      <div
        className={[
          "mx-auto mb-8.5 max-w-180 text-center sm:mb-10.5",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <p
          className={`text-[13px] font-medium tracking-[0.08em] uppercase ${dark ? "text-biz-lime" : "text-biz-forest-light"}`}
        >
          {eyebrow}
        </p>
        <h2
          className={`mt-3 text-[clamp(2.35rem,4.3vw,4.35rem)] leading-[0.94] font-medium tracking-[-0.065em] ${dark ? "text-white" : "text-biz-ink"}`}
        >
          {title}
        </h2>
        <p
          className={`mx-auto mt-4 max-w-140 text-[15px] leading-[1.65] ${dark ? "text-white/65" : "text-biz-muted"}`}
        >
          {copy}
        </p>
      </div>
    );
  }

  return (
    <div
      className={[
        "mb-10.5 grid items-end gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.48fr)] lg:gap-15.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div>
        <p
          className={`text-[13px] font-medium tracking-[0.08em] uppercase ${dark ? "text-biz-lime" : "text-biz-forest-light"}`}
        >
          {eyebrow}
        </p>
        <h2
          className={`mt-3.5 text-[clamp(2.45rem,4.3vw,4.2rem)] leading-[0.94] font-medium tracking-[-0.065em] ${dark ? "text-white" : "text-biz-ink"}`}
        >
          {title}
        </h2>
      </div>
      <p
        className={`max-w-140 text-[15px] leading-[1.65] ${dark ? "text-white/62" : "text-biz-muted"}`}
      >
        {copy}
      </p>
    </div>
  );
}
