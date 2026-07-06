import Link from "next/link";
import AppButton from "../buttons/AppButton";

const dots = [
  { size: 60, color: "bg-pink", className: "left-[12%] top-15" },
  { size: 44, color: "bg-biru", className: "bottom-17.5 right-[14%]" },
  { size: 34, color: "bg-hijau", className: "right-[20%] top-25" },
];

export default function CTAHomeBIZ() {
  return (
    <section className="relative overflow-hidden bg-kuning-t py-24 text-center">
      {dots.map((dot, i) => (
        <span
          key={i}
          className={`absolute rounded-full ${dot.color} ${dot.className}`}
          style={{ width: dot.size, height: dot.size }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-280 px-7">
        <h2 className="mx-auto mb-5 max-w-170 text-[34px] font-extrabold leading-tight md:text-[52px]">
          Yaudah, mulai aja dulu.
        </h2>
        <p className="mx-auto mb-9 max-w-120 text-lg leading-[1.6] text-ink-soft">
          Belajar fundamental AI gratis, komunitas gratis. Nggak ada alasan
          buat nunggu.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/auth/login">
            <AppButton variant="ink" size="cta">Mulai dari Foundation →</AppButton>
          </Link>
          <AppButton variant="white" size="cta">Gabung komunitas</AppButton>
        </div>
        <div className="mt-4 text-[13.5px] text-ink-soft/70">
          No credit card. No komitmen. Tinggal mulai.
        </div>
      </div>
    </section>
  );
}
