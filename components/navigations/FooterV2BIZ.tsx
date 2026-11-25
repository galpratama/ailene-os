"use client";

import { V2_FORM_ANCHOR, V2_WRAP, v2NavLinks, v2Resources, v2Services, type V2Page } from "@/lib/biz-home-v2";
import { trackCTAClick, trackWhatsAppLead } from "@/lib/conversion";
import { siteProfile, WHATSAPP_URL } from "@/lib/site";
import { IconBrandWhatsapp } from "@tabler/icons-react";
import Image from "next/image";
import type { ReactNode } from "react";

const linkClass = "inline-flex min-h-11 items-center gap-2 hover:text-v2-ink hover:underline";

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="mb-3.5 font-jakarta text-[0.95rem] font-extrabold tracking-[-0.01em] text-v2-ink">{title}</h2>
      <ul>{children}</ul>
    </div>
  );
}

export default function FooterV2BIZ({ page }: { page: V2Page }) {
  return (
    <footer className="border-t border-v2-rule bg-v2-paper-2 pt-18 pb-10 text-[0.95rem] text-v2-ink-2">
      <div className={V2_WRAP}>
        <div className="grid grid-cols-1 gap-10 min-[480px]:grid-cols-2 min-[860px]:grid-cols-4 min-[1100px]:grid-cols-[1.4fr_1fr_1fr_1fr_1.1fr]">
          <div className="min-[480px]:col-span-2 min-[860px]:col-span-4 min-[1100px]:col-span-1">
            <a href={page === "home" ? "#top" : "/"} aria-label="Ailene for Business, beranda" className="inline-block">
              <Image src="/biz/v2/ailene-business-horizontal.svg" width={220} height={47} alt="Ailene for Business" className="h-auto w-55" />
            </a>
            <p className="mt-7 font-jakarta text-[2.1rem] leading-none font-extrabold tracking-[-0.035em] text-v2-ink">Make AI stick.</p>
            <p className="mt-3.5 max-w-[34ch]">Mitra transformasi AI untuk perusahaan Indonesia. Dilatih pada pekerjaan nyata, diukur setiap kuartal.</p>
          </div>
          <Column title="Layanan">
            {v2Services.map((service) => (
              <li key={service.name}>
                <a href={service.href} className={linkClass}>
                  {service.name}
                </a>
              </li>
            ))}
          </Column>
          <Column title="Ailene">
            {v2NavLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} aria-current={link.page && link.page === page ? "page" : undefined} className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </Column>
          <Column title="Lainnya">
            {v2Resources.map((resource) => (
              <li key={resource.href}>
                <a href={resource.href} className={linkClass}>
                  {resource.name}
                </a>
              </li>
            ))}
          </Column>
          <Column title="Kontak">
            <li>
              <a href={`#${V2_FORM_ANCHOR}`} onClick={() => trackCTAClick({ placement: "footer_nav" })} className={linkClass}>
                Jadwalkan konsultasi 20 menit
              </a>
            </li>
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppLead({ placement: "footer" })}
                className={linkClass}
              >
                <IconBrandWhatsapp size={18} aria-hidden="true" />
                {siteProfile.phone}
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/ailene.learn/" target="_blank" rel="noopener noreferrer" className={linkClass}>
                Instagram @ailene.learn
              </a>
            </li>
          </Column>
        </div>
        <div className="mt-14 flex flex-wrap justify-between gap-x-6 gap-y-3 border-t border-v2-rule pt-6 text-[0.85rem] text-v2-ink-3">
          <span>© {new Date().getFullYear()} Ailene for Business</span>
          <span>Ailene dibaca &ldquo;Ai-lin&rdquo;.</span>
        </div>
      </div>
    </footer>
  );
}
