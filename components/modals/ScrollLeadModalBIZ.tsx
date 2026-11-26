"use client";

import AppButton from "@/components/buttons/AppButton";
import { createInboundLead } from "@/lib/actions";
import { trackFormLead } from "@/lib/conversion";
import InboundLeadFieldsBIZ, {
  toInboundLeadPayload,
} from "@/components/forms/InboundLeadFieldsBIZ";
import { Check, Clock, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type SubmitState = "idle" | "sending" | "sent" | "error";

function getCurrentJakartaMonth(): string {
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    timeZone: "Asia/Jakarta",
  }).format(new Date());
}

export default function ScrollLeadModalBIZ({
  triggerId = "curriculum",
}: {
  triggerId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  useEffect(() => {
    const target = document.getElementById(triggerId);
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Open once the visitor reaches the first high-intent proof section.
          setIsOpen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [triggerId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const closeModal = () => setIsOpen(false);

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

    setSubmitState("error");
  };

  if (!isOpen) return null;

  const currentMonth = getCurrentJakartaMonth();

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-biz-forest/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scroll-lead-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div className="relative my-4 max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-biz-paper p-5 text-biz-ink shadow-2xl sm:p-7">
        <AppButton
          type="button"
          variant="ghostBiz"
          size="icon"
          aria-label="Tutup form"
          onClick={closeModal}
          className="absolute top-4 right-4"
        >
          <X size={19} />
        </AppButton>

        {submitState === "sent" ? (
          <div className="grid place-items-center gap-3 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-biz-lime text-biz-forest">
              <Check size={22} strokeWidth={2.5} />
            </span>
            <h2
              id="scroll-lead-modal-title"
              className="max-w-120 text-3xl font-bold tracking-[-0.035em] text-biz-forest"
            >
              Kebutuhan Anda sudah masuk.
            </h2>
            <p className="max-w-105 text-[15px] leading-[1.65] text-biz-muted">
              Tim kami akan menghubungi Anda melalui kontak yang ditinggalkan.
            </p>
            <AppButton
              type="button"
              variant="forest"
              size="cta"
              className="font-bold!"
              onClick={closeModal}
            >
              Tutup
            </AppButton>
          </div>
        ) : (
          <>
            <div className="mr-10 inline-flex flex-wrap items-center gap-2 rounded-xl border border-biz-forest/15 bg-biz-check/70 px-3 py-2 text-xs text-biz-forest">
              <span className="inline-flex items-center gap-1 rounded-full bg-biz-lime px-2 py-0.5 text-[11px] font-bold tracking-[0.04em] text-biz-forest uppercase">
                <Clock size={12} aria-hidden="true" />
                Kuota terbatas
              </span>
              <span className="font-semibold">
                Special Free AI Readiness Assessment untuk 10 klien pertama di bulan {currentMonth}
              </span>
            </div>

            <p className="mt-4 pr-10 text-[12px] font-semibold tracking-[0.08em] text-biz-forest-light uppercase">
              Mulai percakapan
            </p>
            <h2
              id="scroll-lead-modal-title"
              className="mt-1.5 max-w-130 text-[clamp(1.85rem,3.8vw,2.75rem)] leading-[1.04] font-bold tracking-[-0.035em] text-biz-forest"
            >
              Siap bikin kerja tim lebih cepat?
            </h2>
            <p className="mt-2.5 max-w-130 text-sm leading-[1.6] text-biz-muted">
              Ceritakan konteks singkatnya. Kami bantu petakan skor kesiapan AI
              tim Anda dan pilih format program yang paling tepat.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <InboundLeadFieldsBIZ />
              <div className="flex flex-wrap items-center gap-3">
                <AppButton
                  type="submit"
                  variant="lime"
                  size="cta"
                  className="font-bold!"
                  disabled={submitState === "sending"}
                >
                  {submitState === "sending" ? "Mengirim..." : "Kirim kebutuhan"}
                </AppButton>
                {submitState === "error" && (
                  <p className="text-xs text-biz-muted">
                    Pengiriman belum berhasil. Coba lagi sebentar lagi.
                  </p>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
