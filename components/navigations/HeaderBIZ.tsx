"use client";

import AppButton from "@/components/buttons/AppButton";
import PageMargin from "@/components/layouts/PageMargin";
import { LogoAilene } from "@/components/svg/LogoAilene";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "How We Work", fragment: "#how-we-work" },
  { label: "Programs", fragment: "#programs" },
  { label: "FAQ", fragment: "#faq" },
];

export default function HeaderBIZ({ isHome = false }: { isHome?: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 20);

    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  const hrefFor = (fragment: string) => (isHome ? fragment : `/${fragment}`);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white text-biz-ink transition-shadow duration-300 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <PageMargin className="flex min-h-17.5 items-center justify-between gap-4">
        <Link
          href={isHome ? "#top" : "/"}
          aria-label="Ailene for business home"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <LogoAilene className="h-7 w-auto" />
          <span className="pt-2 tracking-[-0.02em]">for Business</span>
        </Link>

        <nav aria-label="Navigasi utama" className="ml-auto hidden items-center gap-6.5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={hrefFor(link.fragment)}
              className="text-[15px] font-medium opacity-75 transition-opacity hover:opacity-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <AppButton href={hrefFor("#contact")} variant="lime" size="cta" trackPlacement="header">
            Konsultasi Gratis
          </AppButton>
        </div>

        <AppButton
          type="button"
          variant="ghost"
          size="icon"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          aria-controls="biz-mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
          className="lg:hidden !text-biz-forest hover:!bg-biz-forest/8"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </AppButton>
      </PageMargin>

      {menuOpen && (
        <nav
          id="biz-mobile-nav"
          aria-label="Navigasi mobile"
          className="mx-4 grid gap-1 rounded-xl border border-biz-forest/10 bg-biz-paper p-2.5 text-biz-ink shadow-2xl lg:hidden"
        >
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={hrefFor(link.fragment)}
              onClick={closeMenu}
              className="rounded-lg px-3.5 py-3 text-base font-medium hover:bg-biz-forest/6"
            >
              {link.label}
            </Link>
          ))}
          <AppButton
            href={hrefFor("#contact")}
            variant="lime"
            trackPlacement="header_mobile"
            onClick={closeMenu}
            className="mt-1 w-full"
          >
            Konsultasi Gratis
          </AppButton>
        </nav>
      )}
    </header>
  );
}
