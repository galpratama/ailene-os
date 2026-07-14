import { LogoAilene } from "@/components/svg/LogoAilene";
import Link from "next/link";

const navLinks = [
  { label: "Kurikulum", href: "/#kurikulum" },
  { label: "Komunitas", href: "/#komunitas" },
  { label: "Event", href: "/#event" },
  { label: "Jadi trainer", href: "/join-trainer" },
];

export default function HeaderBIZ() {
  return (
    <nav className="sticky top-0 z-50 border-b border-ink-line bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-280 items-center justify-between px-7 py-4">
        <LogoAilene className="h-6 w-auto text-ink" />

        <div className="hidden gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="cursor-pointer text-[14.5px] font-semibold text-ink-soft hover:text-ink"
            >
              {link.label}
            </Link>
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
