import Link from "next/link";
import AppButton from "../buttons/AppButton";

const dots = [
  { size: 80, color: "bg-kuning", className: "left-[6%] top-20 opacity-90" },
  { size: 52, color: "bg-pink", className: "right-[9%] top-45" },
  { size: 38, color: "bg-biru", className: "bottom-30 left-[14%]" },
  { size: 64, color: "bg-hijau", className: "bottom-20 right-[12%] opacity-85" },
  { size: 30, color: "bg-oranye", className: "left-[22%] top-30" },
];

export default function HeroHomeBIZ() {
  return (
    <section className="relative overflow-hidden py-20 text-center">
      {dots.map((dot, i) => (
        <span
          key={i}
          className={`absolute rounded-full ${dot.color} ${dot.className}`}
          style={{ width: dot.size, height: dot.size }}
        />
      ))}

      <div className="relative z-10 mx-auto max-w-280 px-7">
        <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-ink-line bg-off px-4 py-1.5 text-[13px] font-semibold text-ink-soft">
          <span className="size-2 rounded-full bg-hijau" />
          Komunitas belajar AI gratis di Indonesia
        </div>

        <h1 className="mx-auto mb-5 max-w-200 text-[38px] font-extrabold leading-[1.08] tracking-tight md:text-[60px]">
          Bingung harus mulai{" "}
          <span className="relative whitespace-nowrap">
            <span className="absolute -inset-x-1 bottom-1.5 -z-10 h-4 rounded bg-kuning" />
            belajar AI
          </span>{" "}
          darimana?
        </h1>

        <p className="mx-auto mb-9 max-w-140 text-[18.5px] leading-[1.65] text-ink-soft">
          Banyak konten AI di luar sana, tapi nggak ada yang jelasin urutan dan
          fundamental yang benernya. Di Ailene, kamu belajar dari nol — runtut,
          ada kurikulumnya.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/auth/login">
            <AppButton variant="ink" size="cta">Mulai dari Foundation →</AppButton>
          </Link>
          <AppButton variant="white" size="cta">Lihat kurikulum</AppButton>
        </div>

        <div className="mt-4 text-[13.5px] text-ink-soft/70">
          Gratis buat mulai. No credit card. No ribet.
        </div>
      </div>
    </section>
  );
}
