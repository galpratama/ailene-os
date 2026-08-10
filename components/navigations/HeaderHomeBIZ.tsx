"use client";

import AppButton from "@/components/buttons/AppButton";
import LinkButtonBIZ from "@/components/buttons/LinkButtonBIZ";
import { LogoAilene } from "@/components/svg/LogoAilene";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const navLinks = [
  { label: "How We Work", href: "#how-we-work" },
  { label: "Programs", href: "#programs" },
  { label: "FAQ", href: "#faq" },
];

const announcement = (
  <>
    <span className="font-mono text-[8px] font-bold tracking-[0.14em] uppercase">
      Batch Agustus 2026
    </span>
    <span className="text-xs font-semibold">10 slot pertama dapat harga spesial.</span>
    <a
      href="https://wa.me/6285110545698"
      target="_blank"
      rel="noreferrer"
      className="border-b border-current text-xs font-bold"
    >
      Amankan slot →
    </a>
  </>
);

export default function HeaderHomeBIZ() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const delta = currentScrollY - lastScrollY.current;

      setIsScrolled(currentScrollY > 20);
      setIsHidden(currentScrollY > 20 && delta > 2 && !menuOpen);
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`left-0 z-50 w-full transition-[transform,background-color,color] duration-300 ${
        isScrolled
          ? "fixed top-0 bg-biz-paper/92 text-biz-ink shadow-sm backdrop-blur-xl"
          : "absolute top-0 text-white"
      } ${isHidden ? "pointer-events-none -translate-y-full" : "translate-y-0"}`}
    >
      <aside className="overflow-hidden border-b border-biz-forest/25 bg-biz-lime text-biz-forest">
        <div className="biz-marquee flex w-max [animation:biz-marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              aria-hidden={index > 0}
              className="flex min-h-11 shrink-0 items-center gap-3 whitespace-nowrap py-2 pl-9 after:ml-3 after:size-1 after:rounded-full after:bg-current after:opacity-50"
            >
              {announcement}
            </div>
          ))}
        </div>
      </aside>

      <div className="mx-auto flex min-h-17.5 w-full max-w-315 items-center justify-between gap-4 px-4.5 sm:px-7.5">
        <Link href="#top" aria-label="Ailene home" onClick={closeMenu}>
          <LogoAilene className="h-7 w-auto" />
        </Link>

        <nav aria-label="Navigasi utama" className="ml-auto hidden items-center gap-6.5 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[13px] font-medium opacity-75 transition-opacity hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <LinkButtonBIZ
            href="https://wa.me/6285110545698"
            variant="lime"
            className="min-h-10 rounded-[7px]"
          >
            Diskusikan Kebutuhan Tim
          </LinkButtonBIZ>
        </div>

        <AppButton
          type="button"
          variant="ghost"
          size="icon"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          aria-controls="home-biz-mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
          className={`lg:hidden ${isScrolled ? "!text-biz-forest hover:!bg-biz-forest/8" : "!text-white hover:!bg-white/10"}`}
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </AppButton>
      </div>

      {menuOpen && (
        <nav
          id="home-biz-mobile-nav"
          aria-label="Navigasi mobile"
          className="mx-4 grid gap-1 rounded-xl border border-biz-forest/10 bg-biz-paper p-2.5 text-biz-ink shadow-2xl lg:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={closeMenu}
              className="rounded-lg px-3.5 py-3 text-sm font-medium hover:bg-biz-forest/6"
            >
              {link.label}
            </a>
          ))}
          <LinkButtonBIZ
            href="https://wa.me/6285110545698"
            variant="lime"
            className="mt-1 w-full"
          >
            Diskusikan Kebutuhan Tim
          </LinkButtonBIZ>
        </nav>
      )}
    </header>
  );
}
