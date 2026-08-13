"use client";

import AppButton from "@/components/buttons/AppButton";
import { sendLeadEvent } from "@/lib/fbq";
import { sendConversionEvent } from "@/lib/gtag";
import { Check } from "lucide-react";
import type { FormEvent } from "react";

const fieldClass = "min-h-11 w-full rounded-lg border border-biz-forest/15 bg-white px-3.5 text-sm text-biz-ink outline-none placeholder:text-biz-muted/55 focus:border-biz-forest-light focus:ring-3 focus:ring-biz-lime/25";

export default function LeadFormHomeBIZ() {
  const submitToWhatsApp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      `Halo Ailene, saya ${data.get("name") || ""}.`,
      `WhatsApp: ${data.get("phone") || "-"}.`,
      `Perusahaan: ${data.get("company") || "-"}.`,
      `Fungsi tim: ${data.get("team") || "-"}.`,
      `Kebutuhan: ${data.get("context") || "-"}.`,
    ].join("\n");

    window.open(`https://wa.me/6285110545698?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    sendConversionEvent();
    sendLeadEvent();
  };

  return (
    <section id="contact" className="bg-biz-paper py-18 sm:py-28">
      <div className="mx-auto grid w-full max-w-315 items-start gap-10 px-4.5 sm:px-7.5 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-[13px] font-medium tracking-[0.08em] text-biz-forest-light uppercase">Start a conversation</p>
          <h2 className="mt-3.5 max-w-140 text-[clamp(2.35rem,4vw,4rem)] leading-[1.02] font-medium tracking-[-0.06em]">Tim Anda sudah punya kebutuhan. Kita bantu membuat langkah berikutnya jelas.</h2>
          <p className="mt-5 max-w-140 text-[15px] leading-[1.65] text-biz-muted">Ceritakan sedikit konteks tim, fungsi yang ingin dibantu, atau workflow yang ingin dicoba. Percakapan awal dimulai dari kebutuhan Anda.</p>
          <ul className="mt-6.5 grid gap-3">
            {["Rekomendasi format yang sesuai", "Contoh outcome yang realistis", "Bukan sales pitch — percakapan awal fokus ke kebutuhan tim Anda"].map((item) => (
              <li key={item} className="grid grid-cols-[20px_1fr] gap-2.5 text-sm leading-[1.55] text-biz-muted"><span className="grid size-5 place-items-center rounded-full bg-biz-lime text-biz-forest"><Check size={12} strokeWidth={2.5} /></span>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-biz-forest/12 bg-white p-5 shadow-[0_18px_50px_rgba(6,35,25,0.08)] sm:p-7">
          <p className="text-[12px] font-medium tracking-[0.08em] text-biz-forest-light uppercase">Form kebutuhan tim</p>
          <h3 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-biz-forest">Bagikan konteks singkat.</h3>
          <form onSubmit={submitToWhatsApp} className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-semibold text-biz-ink">Nama lengkap<input name="name" required placeholder="Nama kamu" className={fieldClass} /></label>
              <label className="grid gap-2 text-xs font-semibold text-biz-ink">WhatsApp<input name="phone" required placeholder="08xxxxxxxxxx" className={fieldClass} /></label>
              <label className="grid gap-2 text-xs font-semibold text-biz-ink">Nama perusahaan<input name="company" placeholder="Nama perusahaan" className={fieldClass} /></label>
              <label className="grid gap-2 text-xs font-semibold text-biz-ink">Fungsi tim<select name="team" defaultValue="" className={fieldClass}><option value="" disabled>Pilih fungsi tim</option><option>General</option><option>Procurement</option><option>Developer</option><option>Marketing</option><option>Sales</option><option>Finance</option><option>HR</option><option>Operations</option><option>Others</option></select></label>
              <label className="grid gap-2 text-xs font-semibold text-biz-ink sm:col-span-2">Kebutuhan saat ini<textarea name="context" rows={5} placeholder="Ceritakan target atau workflow yang ingin dibantu" className={`${fieldClass} resize-y py-3`} /></label>
            </div>
            <AppButton type="submit" variant="green" size="cta" className="mt-5 !bg-biz-lime !text-biz-forest hover:!bg-biz-lime/90">Lanjut ke WhatsApp</AppButton>
          </form>
        </div>
      </div>
    </section>
  );
}
