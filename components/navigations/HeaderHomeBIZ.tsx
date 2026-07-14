import LinkButtonBIZ from "@/components/buttons/LinkButtonBIZ";
import Link from "next/link";

const navLinks = [
  { label: "Packages", href: "#packages" },
  { label: "Compare", href: "#compare" },
  { label: "Trainers", href: "#trainers" },
];

export default function HeaderHomeBIZ() {
  return (
    <nav aria-label="Navigasi utama" className="border-b-2 border-gray-200 bg-white">
      <div className="mx-auto flex min-h-19 w-[min(1180px,calc(100%-48px))] items-center justify-between gap-6">
        <Link href="#top" className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-[7px] bg-ink text-sm text-white">
            A
          </span>
          <span className="font-script text-[34px] leading-none font-bold">
            ailene
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] font-bold tracking-[0.06em] uppercase text-ink hover:text-coral"
            >
              {link.label}
            </a>
          ))}
          <LinkButtonBIZ href="#contact">Talk to a Consultant</LinkButtonBIZ>
        </div>

        <div className="lg:hidden">
          <LinkButtonBIZ href="#contact">Talk to a Consultant</LinkButtonBIZ>
        </div>
      </div>
    </nav>
  );
}
