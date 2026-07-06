import Link from "next/link";

const navLinks = ["Kurikulum", "Komunitas", "Event"];

export default function HeaderBIZ() {
  return (
    <nav className="sticky top-0 z-50 border-b border-ink-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-280 items-center justify-between px-7 py-4">
        <div className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight">
          <span className="flex size-5.5 items-center justify-center rounded-[7px] bg-ink text-[13px] text-white">
            A
          </span>
          Ailene
        </div>

        <div className="hidden gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              className="cursor-pointer text-[14.5px] font-semibold text-ink-soft hover:text-ink"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/auth/login"
            className="text-[14.5px] font-semibold text-ink-soft hover:text-ink"
          >
            Masuk
          </Link>
          <Link
            href="/auth/login"
            className="rounded-[10px] bg-ink px-4.5 py-2.25 text-sm font-bold text-white"
          >
            Mulai belajar
          </Link>
        </div>
      </div>
    </nav>
  );
}
