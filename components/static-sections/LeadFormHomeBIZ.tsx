"use client";

import type { IndustryEntry } from "@/apis/lookup";
import type { LeadChannel } from "@/apis/sales";
import AppButton from "@/components/buttons/AppButton";
import { createInboundLead } from "@/lib/actions";
import { trackFormLead, trackWhatsAppLead } from "@/lib/conversion";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";

const fieldClass = "min-h-11 w-full rounded-lg border border-biz-forest/15 bg-white px-3.5 text-sm text-biz-ink outline-none placeholder:text-biz-muted/55 focus:border-biz-forest-light focus:ring-3 focus:ring-biz-lime/25";

// Values are the API's `lead_channel` enum; only the labels are localised.
const channelOptions: { value: LeadChannel; label: string }[] = [
  { value: "referral", label: "Rekomendasi kolega" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "thread", label: "Threads" },
];

type SubmitState = "idle" | "sending" | "sent" | "duplicate" | "error";

export default function LeadFormHomeBIZ({ industries }: { industries: IndustryEntry[] }) {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (key: string) => String(data.get(key) ?? "").trim();
    const channel = text("lead_channel");

    setSubmitState("sending");
    const result = await createInboundLead({
      company_name: text("company"),
      industry_id: Number(text("industry_id")) || null,
      website_url: text("website") || null,
      contact: {
        full_name: text("name"),
        email: text("email") || null,
        phone: text("phone") || null,
        job_title: text("job_title") || null,
      },
      lead_channel: (channel as LeadChannel) || null,
      note: text("context") || null,
    });

    if (result.success) {
      trackFormLead({ placement: "lead_form" });
      setSubmitState("sent");
      return;
    }
    setSubmitState(result.duplicateCompany ? "duplicate" : "error");
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
          {submitState === "sent" ? (
            <div className="grid gap-3 py-6 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-biz-lime text-biz-forest"><Check size={20} strokeWidth={2.5} /></span>
              <h3 className="text-3xl font-medium tracking-[-0.05em] text-biz-forest">Terima kasih — kebutuhan Anda sudah masuk.</h3>
              <p className="text-[15px] leading-[1.65] text-biz-muted">Tim kami akan menghubungi Anda melalui kontak yang Anda tinggalkan.</p>
            </div>
          ) : (
            <>
              <p className="text-[12px] font-medium tracking-[0.08em] text-biz-forest-light uppercase">Form kebutuhan tim</p>
              <h3 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-biz-forest">Bagikan konteks singkat.</h3>
              <form onSubmit={handleSubmit} className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-xs font-semibold text-biz-ink">Nama lengkap<input name="name" required maxLength={255} placeholder="Nama kamu" className={fieldClass} /></label>
                  <label className="grid gap-2 text-xs font-semibold text-biz-ink">Email kerja<input name="email" type="email" required maxLength={255} placeholder="nama@perusahaan.com" className={fieldClass} /></label>
                  <label className="grid gap-2 text-xs font-semibold text-biz-ink">Nomor WhatsApp<input name="phone" maxLength={64} placeholder="08xxxxxxxxxx" className={fieldClass} /></label>
                  <label className="grid gap-2 text-xs font-semibold text-biz-ink">Jabatan<input name="job_title" maxLength={255} placeholder="Contoh: HR Manager" className={fieldClass} /></label>
                  <label className="grid gap-2 text-xs font-semibold text-biz-ink">Nama perusahaan<input name="company" required maxLength={255} placeholder="Nama perusahaan" className={fieldClass} /></label>
                  <label className="grid gap-2 text-xs font-semibold text-biz-ink">Website perusahaan<input name="website" type="url" maxLength={2048} placeholder="https://perusahaan.com" className={fieldClass} /></label>
                  {industries.length > 0 && <label className="grid gap-2 text-xs font-semibold text-biz-ink">Industri<select name="industry_id" defaultValue="" className={fieldClass}><option value="">Pilih industri (opsional)</option>{industries.map((industry) => (<option key={industry.id} value={industry.id}>{industry.name}</option>))}</select></label>}
                  <label className={`grid gap-2 text-xs font-semibold text-biz-ink ${industries.length > 0 ? "" : "sm:col-span-2"}`}>Tahu Ailene dari mana?<select name="lead_channel" defaultValue="" className={fieldClass}><option value="">Pilih salah satu (opsional)</option>{channelOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}</select></label>
                  <label className="grid gap-2 text-xs font-semibold text-biz-ink sm:col-span-2">Kebutuhan saat ini<textarea name="context" rows={5} maxLength={2000} placeholder="Ceritakan target atau workflow yang ingin dibantu" className={`${fieldClass} resize-y py-3`} /></label>
                </div>
                <AppButton type="submit" variant="green" size="cta" disabled={submitState === "sending"} className="mt-5 !bg-biz-lime !text-biz-forest hover:!bg-biz-lime/90">{submitState === "sending" ? "Mengirim..." : "Kirim kebutuhan"}</AppButton>
                {submitState === "duplicate" && <p className="mt-3 text-xs text-biz-muted">Perusahaan ini sudah terdaftar di sistem kami. Tim kami akan menindaklanjuti lewat kontak yang sudah ada.</p>}
                {submitState === "error" && <p className="mt-3 text-xs text-biz-muted">Pengiriman belum berhasil. Coba lagi sebentar lagi, atau <a href="https://wa.me/6285110545698" target="_blank" rel="noreferrer" onClick={() => trackWhatsAppLead({ placement: "lead_form" })} className="font-semibold text-biz-forest underline">hubungi kami di WhatsApp</a>.</p>}
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
