"use client";

import AppButton from "@/components/buttons/AppButton";
import { V2_FORM_ANCHOR, V2_WRAP, v2NavLinks, v2Resources, v2Services, type V2Page } from "@/lib/biz-home-v2";
import { IconBrandWhatsapp, IconChevronDown, IconMenu2, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const navItemClass =
  "inline-flex min-h-11 flex-none items-center gap-1.5 rounded-md px-2.5 text-[0.95rem] font-semibold whitespace-nowrap text-v2-ink-2 hover:text-v2-ink";

// The current page gets a straight 2px rule under its label.
const currentClass =
  "relative aria-[current=page]:text-v2-ink aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-2.5 aria-[current=page]:after:bottom-0 aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-v2-ink";

type MenuKey = "services" | "resources";
type Menu = { key: MenuKey; label: string; items: readonly { name: string; hint: string; href: string }[] };

const servicesMenu: Menu = { key: "services", label: "Layanan", items: v2Services };
const resourcesMenu: Menu = { key: "resources", label: "Lainnya", items: v2Resources };

function NavMenu({
  menu,
  open,
  onToggle,
  onClose,
  align,
}: {
  menu: Menu;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  align: "left" | "right";
}) {
  const id = `v2-${menu.key}-menu`;
  return (
    <div data-nav-menu className="relative">
      <AppButton type="button" variant="bare" size="bare" aria-expanded={open} aria-controls={id} onClick={onToggle} className={navItemClass}>
        {menu.label}
        <IconChevronDown size={14} stroke={2.4} aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </AppButton>
      {open && (
        <div
          id={id}
          className={`absolute top-[calc(100%+10px)] grid w-[min(520px,90vw)] grid-cols-2 gap-1 rounded-2xl border border-v2-rule bg-white p-2.5 shadow-[0_30px_60px_-24px_rgb(10_32_22/0.28)] ${
            align === "left" ? "-left-3" : "-right-3"
          }`}
        >
          {menu.items.map((item) => (
            <a key={item.href} href={item.href} onClick={onClose} className="block rounded-[10px] px-3.5 py-3 hover:bg-v2-paper-2">
              <b className="block text-[0.98rem] text-v2-ink">{item.name}</b>
              <span className="mt-0.5 block text-[0.84rem] leading-[1.4] text-v2-ink-2">{item.hint}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeaderV2BIZ({ page }: { page: V2Page }) {
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);

  useEffect(() => {
    if (!open && !openMenu) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      setOpenMenu(null);
    };
    const onPointer = (event: PointerEvent) => {
      if (!(event.target as Element).closest?.("[data-nav-menu]")) setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, openMenu]);

  const menuProps = (menu: Menu) => ({
    menu,
    open: openMenu === menu.key,
    onToggle: () => setOpenMenu((value) => (value === menu.key ? null : menu.key)),
    onClose: () => setOpenMenu(null),
  });

  return (
    <header className="sticky top-0 z-50 border-b border-v2-forest/8 bg-white/78 text-v2-ink backdrop-blur-md backdrop-saturate-160">
      <div className={`${V2_WRAP} flex h-18 items-center gap-4`}>
        <a href={page === "home" ? "#top" : "/"} aria-label="Ailene for Business, beranda" className="flex-none">
          <Image
            src="/biz/v2/ailene-business-horizontal.svg"
            width={200}
            height={42}
            alt="Ailene for Business"
            priority
            className="h-auto w-40 sm:w-44"
          />
        </a>
        <nav aria-label="Utama" className="ml-auto hidden items-center gap-0.5 xl:flex">
          <NavMenu {...menuProps(servicesMenu)} align="left" />
          {v2NavLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={link.page === page ? "page" : undefined}
              className={`${navItemClass} ${currentClass}`}
            >
              {link.label}
            </a>
          ))}
          <NavMenu {...menuProps(resourcesMenu)} align="right" />
        </nav>
        <div className="flex-none whitespace-nowrap max-xl:hidden">
          <AppButton href={`#${V2_FORM_ANCHOR}`} variant="forestV2" size="header" trackPlacement="header">
            <IconBrandWhatsapp size={18} aria-hidden="true" />
            Jadwalkan konsultasi 20 menit
          </AppButton>
        </div>
        <AppButton
          type="button"
          variant="bare"
          size="bare"
          aria-expanded={open}
          aria-controls="v2-mobile-nav"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((value) => !value)}
          className="ml-auto size-11 justify-center rounded-lg border border-v2-rule xl:hidden"
        >
          {open ? <IconX size={22} aria-hidden="true" /> : <IconMenu2 size={22} aria-hidden="true" />}
        </AppButton>
      </div>
      {open && (
        <div id="v2-mobile-nav" className="max-h-[calc(100dvh-72px)] overflow-auto border-t border-v2-rule bg-white xl:hidden">
          <div className={`${V2_WRAP} pt-3 pb-6`}>
            {[
              ...v2Services.map((service) => ({ label: service.name, hint: service.short, href: service.href, page: undefined })),
              ...v2NavLinks,
              ...v2Resources.map((resource) => ({ label: resource.name, hint: undefined, href: resource.href, page: undefined })),
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={link.page && link.page === page ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center border-b border-v2-rule px-1 font-semibold aria-[current=page]:text-v2-green"
              >
                {link.label}
                {link.hint && <span className="ml-auto text-[0.85rem] font-medium text-v2-ink-3">{link.hint}</span>}
              </a>
            ))}
            <div className="mt-5 grid">
              <AppButton href={`#${V2_FORM_ANCHOR}`} variant="forestV2" size="cta" trackPlacement="header_mobile" onClick={() => setOpen(false)}>
                <IconBrandWhatsapp size={18} aria-hidden="true" />
                Jadwalkan konsultasi 20 menit
              </AppButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
