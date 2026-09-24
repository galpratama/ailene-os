"use client";

import AppButton from "@/components/buttons/AppButton";
import { LogoAilene } from "@/components/svg/LogoAilene";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import PageMargin from "@/components/layouts/PageMargin";

const navLinks = [
  { label: "How We Work", href: "#how-we-work" },
  { label: "Programs", href: "#programs" },
  { label: "FAQ", href: "#faq" },
];

export default function HeaderHomeBIZ() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateHeader = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white text-biz-ink transition-shadow duration-300 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <PageMargin className="flex min-h-17.5 items-center justify-between gap-4">
        <Link
          href="#top"
          aria-label="Ailene for business home"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <LogoAilene className="h-7 w-auto" />
          <span className="pt-2 tracking-[-0.02em]">for Business</span>
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="ml-auto hidden items-center gap-6.5 lg:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[15px] font-medium opacity-75 transition-opacity hover:opacity-100"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <AppButton
            href="#contact"
            variant="lime"
            size="cta"
            trackPlacement="header"
          >
            Book Meeting
          </AppButton>
        </div>

        <AppButton
          type="button"
          variant="ghost"
          size="icon"
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          aria-controls="home-biz-mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
          className="lg:hidden !text-biz-forest hover:!bg-biz-forest/8"
        >
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </AppButton>
      </PageMargin>

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
              className="rounded-lg px-3.5 py-3 text-base font-medium hover:bg-biz-forest/6"
            >
              {link.label}
            </a>
          ))}
          <AppButton
            href="#contact"
            variant="lime"
            trackPlacement="header_mobile"
            onClick={closeMenu}
            className="mt-1 w-full"
          >
            Book Meeting
          </AppButton>
        </nav>
      )}
    </header>
  );
}
