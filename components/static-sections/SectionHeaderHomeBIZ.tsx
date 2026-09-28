import type { ReactNode } from "react";

interface SectionHeaderHomeBIZProps {
  eyebrow: string;
  title: ReactNode;
  copy?: string;
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
  // On dark sections the label drops its lime highlight and goes plain white, as in FAQ and Adoption proof.
  const eyebrowClass = dark
    ? "biz-topic-label !text-white before:!hidden after:!hidden"
    : "biz-topic-label";

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
        <p className={eyebrowClass}>{eyebrow}</p>
        <h2
          className={`mt-3 text-[36px] leading-[0.94] font-medium tracking-[-0.065em] lg:text-[44px] ${dark ? "text-white" : "text-biz-ink"}`}
        >
          {title}
        </h2>
        {copy && (
          <p
            className={`mx-auto mt-4 max-w-140 text-[15px] leading-[1.65] ${dark ? "text-white/65" : "text-biz-muted"}`}
          >
            {copy}
          </p>
        )}
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
        <p className={eyebrowClass}>{eyebrow}</p>
        <h2
          className={`mt-3.5 text-[36px] leading-[0.94] font-medium tracking-[-0.065em] lg:text-[44px] ${dark ? "text-white" : "text-biz-ink"}`}
        >
          {title}
        </h2>
      </div>
      {copy && (
        <p
          className={`max-w-140 text-[15px] leading-[1.65] ${dark ? "text-white/62" : "text-biz-muted"}`}
        >
          {copy}
        </p>
      )}
    </div>
  );
}
