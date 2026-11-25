"use client";

import AppButton from "@/components/buttons/AppButton";
import { preselectLeadForm, V2_BODY, V2_FORM_ANCHOR, V2_H3, V2_WRAP, type V2Preselect } from "@/lib/biz-home-v2";
import { IconBrandWhatsapp } from "@tabler/icons-react";

// Closing band of a v2 secondary page: one question, one consult CTA that pre-answers the form below.
export default function NextStepV2BIZ({
  id,
  title,
  body,
  preselect,
  secondary,
}: {
  id: string;
  title: string;
  body: string;
  preselect?: V2Preselect;
  secondary?: { label: string; href: string };
}) {
  return (
    <section aria-labelledby={id} className="border-t border-v2-rule bg-v2-paper py-[clamp(56px,7vw,96px)]">
      <div className={`${V2_WRAP} grid items-center gap-[clamp(32px,5vw,72px)] min-[900px]:grid-cols-2`}>
        <div>
          <h2 id={id} className={V2_H3}>
            {title}
          </h2>
          <p className={`${V2_BODY} mt-3`}>{body}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AppButton
            href={`#${V2_FORM_ANCHOR}`}
            variant="forestV2"
            size="cta"
            trackPlacement="final_cta"
            onClick={() => preselect && preselectLeadForm(preselect)}
          >
            <IconBrandWhatsapp size={18} aria-hidden="true" />
            Jadwalkan konsultasi 20 menit
          </AppButton>
          {secondary && (
            <AppButton href={secondary.href} variant="outlineV2" size="cta">
              {secondary.label}
            </AppButton>
          )}
        </div>
      </div>
    </section>
  );
}
