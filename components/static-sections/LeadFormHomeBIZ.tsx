"use client";

import AppButton from "@/components/buttons/AppButton";
import { createInboundLead } from "@/lib/actions";
import { trackFormLead, trackWhatsAppLead } from "@/lib/conversion";
import InboundLeadFieldsBIZ, {
  toInboundLeadPayload,
} from "@/components/forms/InboundLeadFieldsBIZ";
import { Check } from "lucide-react";
import { useState, type FormEvent } from "react";
import PageMargin from "@/components/layouts/PageMargin";

type SubmitState = "idle" | "sending" | "sent" | "duplicate" | "error";

export default function LeadFormHomeBIZ() {
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toInboundLeadPayload(event.currentTarget);

    setSubmitState("sending");
    const result = await createInboundLead(payload);

    if (result.success) {
      trackFormLead({ placement: "lead_form" });
      setSubmitState("sent");
      return;
    }
    setSubmitState(result.duplicateCompany ? "duplicate" : "error");
  };

  return (
    <section id="contact" className="bg-biz-paper py-18 sm:py-28">
      <PageMargin className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="biz-topic-label">Start a conversation</p>
          <h2 className="mt-3.5 max-w-140 text-[36px] leading-[1.02] font-medium tracking-[-0.06em] lg:text-[44px]">
            Tim Anda sudah punya kebutuhan. Kita bantu membuat langkah
            berikutnya jelas.
          </h2>
          <p className="mt-5 max-w-140 text-[15px] leading-[1.65] text-biz-muted">
            Ceritakan sedikit konteks tim, fungsi yang ingin dibantu, atau
            workflow yang ingin dicoba. Percakapan awal dimulai dari kebutuhan
            Anda.
          </p>
        </div>

        <div className="rounded-xl border border-biz-forest/12 bg-white p-5 shadow-[0_18px_50px_rgba(6,35,25,0.08)] sm:p-7">
          {submitState === "sent" ? (
            <div className="grid gap-3 py-6 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-biz-lime text-biz-forest">
                <Check size={20} strokeWidth={2.5} />
              </span>
              <h3 className="text-3xl font-medium tracking-[-0.05em] text-biz-forest">
                Terima kasih — kebutuhan Anda sudah masuk.
              </h3>
              <p className="text-[15px] leading-[1.65] text-biz-muted">
                Tim kami akan menghubungi Anda melalui kontak yang Anda
                tinggalkan.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[12px] font-medium tracking-[0.08em] text-biz-forest-light uppercase">
                Form kebutuhan tim
              </p>
              <h3 className="mt-2 text-3xl font-medium tracking-[-0.05em] text-biz-forest">
                Bagikan konteks singkat.
              </h3>
              <form onSubmit={handleSubmit} className="mt-6">
                <InboundLeadFieldsBIZ />
                <AppButton
                  type="submit"
                  variant="lime"
                  size="cta"
                  disabled={submitState === "sending"}
                  className="mt-5"
                >
                  {submitState === "sending"
                    ? "Mengirim..."
                    : "Kirim kebutuhan"}
                </AppButton>
                {submitState === "duplicate" && (
                  <p className="mt-3 text-xs text-biz-muted">
                    Data Anda sudah pernah kami terima. Tim kami akan
                    menindaklanjuti lewat kontak yang sudah ada.
                  </p>
                )}
                {submitState === "error" && (
                  <p className="mt-3 text-xs text-biz-muted">
                    Pengiriman belum berhasil. Coba lagi sebentar lagi, atau{" "}
                    <a
                      href="https://wa.me/6285110545698"
                      target="_blank"
                      rel="noreferrer"
                      onClick={() =>
                        trackWhatsAppLead({ placement: "lead_form" })
                      }
                      className="font-semibold text-biz-forest underline"
                    >
                      hubungi kami di WhatsApp
                    </a>
                    .
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </PageMargin>
    </section>
  );
}
