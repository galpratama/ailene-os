"use client";

import { preselectLeadForm, triggerMoments, V2_FORM_ANCHOR, V2_H2, V2_LEAD, V2_SECTION, V2_TEXT_LINK, V2_WRAP } from "@/lib/biz-home-v2";
import { trackCTAClick, trackWhatsAppLead } from "@/lib/conversion";
import { siteProfile, WHATSAPP_URL } from "@/lib/site";
import { IconArrowRight, IconBrandWhatsapp } from "@tabler/icons-react";

const WHATSAPP_CONSULT = `${WHATSAPP_URL}?text=${encodeURIComponent("Halo Ailene, saya ingin konsultasi kesiapan AI.")}`;

export default function CloseV2BIZ() {
  return (
    <section aria-labelledby="v2-close" className={`${V2_SECTION} relative isolate overflow-hidden bg-v2-paper`}>
      <div
        aria-hidden="true"
        className="v2-liquid top-1/2 -left-[6%] -mt-[calc(min(70vw,980px)*0.45)] aspect-[1.1] w-[min(70vw,980px)]"
      >
        <i className="b1" />
        <i className="b2" />
        <i className="b3" />
      </div>
      <div className={`${V2_WRAP} grid items-start gap-[clamp(32px,5vw,80px)] min-[900px]:grid-cols-[5fr_6fr]`}>
        <div className="rounded-[22px] bg-white/70 p-[clamp(20px,3vw,32px)] backdrop-blur-md">
          <h2 id="v2-close" className={`${V2_H2} text-[clamp(2rem,3.6vw,3.1rem)]`}>
            Mari temukan di mana AI paling berdampak untuk bisnis Anda.
          </h2>
          <p className={`${V2_LEAD} mt-5`}>
            Mulai dari konsultasi 20 menit. Jika cocok, kami lanjutkan dengan sesi 90 menit bersama tim pimpinan: satu proses Anda kami bangun ulang dengan AI, langsung di depan Anda.
          </p>
          <p className="mt-7">
            <a
              href={WHATSAPP_CONSULT}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppLead({ placement: "final_cta" })}
              className={`${V2_TEXT_LINK} inline-flex items-center gap-2`}
            >
              <IconBrandWhatsapp size={20} aria-hidden="true" />
              Lebih suka WhatsApp? {siteProfile.phone}
            </a>
          </p>
        </div>
        <div>
          <p className="mb-3.5 font-bold">Apa yang paling mendorong Anda saat ini?</p>
          <div className="v2-glass grid gap-2 rounded-[22px] p-2.5">
            {triggerMoments
              .filter((moment) => moment.prompt)
              .map((moment) => (
                <a
                  key={moment.value}
                  href={`#${V2_FORM_ANCHOR}`}
                  onClick={() => {
                    trackCTAClick({ placement: "final_cta" });
                    preselectLeadForm({ moment: moment.value });
                  }}
                  className="group flex min-h-14 w-full items-center justify-between gap-4 rounded-[10px] border border-transparent bg-white/55 px-5 py-4.5 text-left text-[1.02rem] font-semibold transition-colors hover:border-v2-rule hover:bg-white"
                >
                  <span>
                    {moment.prompt}
                    <small className="mt-0.5 block text-[0.88rem] font-medium text-v2-ink-2">{moment.hint}</small>
                  </span>
                  <IconArrowRight size={18} aria-hidden="true" className="flex-none transition-transform duration-200 group-hover:translate-x-1" />
                </a>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
