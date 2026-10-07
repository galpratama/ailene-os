"use client";

import AppButton from "@/components/buttons/AppButton";
import { createInboundLead } from "@/lib/actions";
import { trackFormLead } from "@/lib/conversion";
import InboundLeadFieldsBIZ, {
  toInboundLeadPayload,
} from "@/components/forms/InboundLeadFieldsBIZ";
import { Check, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type SubmitState = "idle" | "sending" | "sent" | "error";

export default function ScrollLeadModalBIZ() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  useEffect(() => {
    const curriculum = document.getElementById("curriculum");
    if (!curriculum) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // The curriculum is the first high-intent section, so offer the
          // consultation only once it is genuinely in view.
          setIsOpen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(curriculum);
    return () => observer.disconnect();
  }, []);

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
          variant="ghost"
          size="icon"
          aria-label="Tutup form"
          onClick={closeModal}
          className="absolute top-4 right-4 !text-biz-forest hover:!bg-biz-forest/8"
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
              className="max-w-120 text-3xl font-medium tracking-[-0.05em] text-biz-forest"
            >
              Kebutuhan Anda sudah masuk.
            </h2>
            <p className="max-w-105 text-[15px] leading-[1.65] text-biz-muted">
              Tim kami akan menghubungi Anda melalui kontak yang ditinggalkan.
            </p>
            <AppButton type="button" variant="forest" size="cta" onClick={closeModal}>
              Tutup
            </AppButton>
          </div>
        ) : (
          <>
            <p className="pr-10 text-[12px] font-medium tracking-[0.08em] text-biz-forest-light uppercase">
              Mulai percakapan
            </p>
            <h2
              id="scroll-lead-modal-title"
              className="mt-2 max-w-130 text-[clamp(2rem,4vw,3rem)] leading-[1] font-medium tracking-[-0.06em] text-biz-forest"
            >
              Siap bikin kerja tim lebih cepat?
            </h2>
            <p className="mt-3 max-w-125 text-sm leading-[1.6] text-biz-muted">
              Ceritakan konteks singkatnya. Kami bantu pilih format yang paling
              tepat untuk tim Anda.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <InboundLeadFieldsBIZ />
              <div className="flex flex-wrap items-center gap-3">
                <AppButton
                  type="submit"
                  variant="lime"
                  size="cta"
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
