"use client";

import AppButton from "@/components/buttons/AppButton";
import type { InboundLeadPayload } from "@/apis/sales";
import { createInboundLead } from "@/lib/actions";
import { readAttribution } from "@/lib/attribution";
import {
  companySizes,
  serviceInterests,
  triggerMoments,
  V2_FORM_ANCHOR,
  V2_H2,
  V2_LEAD,
  V2_PRESELECT_EVENT,
  V2_SECTION,
  V2_TEXT_LINK,
  V2_WRAP,
  type V2Preselect,
} from "@/lib/biz-home-v2";
import { trackFormLead, trackWhatsAppLead } from "@/lib/conversion";
import { siteProfile, WHATSAPP_URL } from "@/lib/site";
import { IconBrandWhatsapp, IconLoader2 } from "@tabler/icons-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

type Step1 = { moment: string; interest: string; size: string };
type Contact = { name: string; role: string; company: string; email: string; phone: string };
type SubmitState = "idle" | "sending" | "sent" | "duplicate" | "error";

const agenda = [
  ["5 mnt", "Kondisi sekarang", "Alat AI yang sudah dibeli, siapa yang memakai, dan apa yang ditanyakan Direksi."],
  ["10 mnt", "Satu proses paling layak", "Kami tunjukkan di mana AI paling cepat memberi hasil untuk tim Anda."],
  ["5 mnt", "Langkah berikutnya", "Jika cocok: sesi 90 menit membangun ulang proses itu dengan AI, langsung di depan tim pimpinan Anda."],
];

const contactFields: { key: keyof Contact; label: string; type?: string; autoComplete: string; placeholder?: string; error: string; wide?: boolean; valid: (value: string) => boolean }[] = [
  { key: "name", label: "Nama lengkap", autoComplete: "name", error: "Tulis nama Anda.", valid: (v) => v.length >= 2 },
  { key: "role", label: "Jabatan", autoComplete: "organization-title", placeholder: "Contoh: Head of HC", error: "Tulis jabatan Anda.", valid: (v) => v.length >= 2 },
  { key: "company", label: "Nama perusahaan", autoComplete: "organization", error: "Tulis nama perusahaan.", valid: (v) => v.length >= 2 },
  {
    key: "email",
    label: "Email kantor",
    type: "email",
    autoComplete: "email",
    placeholder: "nama@perusahaan.co.id",
    error: "Periksa format email, contoh nama@perusahaan.co.id.",
    valid: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
  },
  {
    key: "phone",
    label: "Nomor WhatsApp",
    type: "tel",
    autoComplete: "tel",
    placeholder: "0812xxxxxxxx",
    error: "Tulis nomor WhatsApp yang aktif, minimal 9 digit.",
    wide: true,
    valid: (v) => v.replace(/\D/g, "").length >= 9,
  },
];

const inputClass =
  "min-h-12.5 w-full rounded-[10px] border-[1.5px] border-v2-rule bg-white px-3.5 text-base text-v2-ink transition-[border-color,box-shadow] outline-none placeholder:text-v2-ink-3/80 hover:border-v2-ink-3 focus:border-v2-forest focus:ring-3 focus:ring-v2-green/22 aria-invalid:border-v2-red aria-invalid:ring-3 aria-invalid:ring-v2-red/12";

const labelOf = (list: readonly { value: string; label: string }[], value: string) => list.find((item) => item.value === value)?.label ?? value;

// The API has no fields for these answers yet, so they travel in the lead note.
function toPayload(answers: Step1, contact: Contact): InboundLeadPayload {
  return {
    company_name: contact.company.trim(),
    contact: {
      full_name: contact.name.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      job_title: contact.role.trim(),
    },
    note: [
      `Pendorong: ${labelOf(triggerMoments, answers.moment)}`,
      `Layanan: ${labelOf(serviceInterests, answers.interest)}`,
      `Jumlah karyawan: ${labelOf(companySizes, answers.size)}`,
    ].join("\n"),
    attribution: readAttribution(),
  };
}

function ErrorText({ id, show, children }: { id: string; show: boolean; children: ReactNode }) {
  return (
    <p id={id} className={`mt-1.5 text-[0.84rem] font-semibold text-v2-red ${show ? "block" : "hidden"}`}>
      {children}
    </p>
  );
}

function Choice({ name, value, checked, onChange, label, hint }: { name: string; value: string; checked: boolean; onChange: () => void; label: string; hint?: string }) {
  return (
    <label className="relative block">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer absolute inset-0 m-0 size-full opacity-0" />
      <span className="block min-h-12 rounded-[10px] border-[1.5px] border-v2-rule px-4 py-3.25 text-[0.95rem] leading-[1.35] font-semibold transition-colors peer-checked:border-v2-forest peer-checked:bg-v2-green-soft peer-checked:shadow-[inset_0_0_0_1px_var(--v2-forest)] peer-hover:border-v2-ink-3 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-v2-green">
        {label}
        {hint && <small className="mt-0.5 block text-[0.82rem] font-medium text-v2-ink-3">{hint}</small>}
      </span>
    </label>
  );
}

export default function LeadFormV2BIZ() {
  const [step, setStep] = useState<1 | 2>(1);
  const [answers, setAnswers] = useState<Step1>({ moment: "", interest: "", size: "" });
  const [contact, setContact] = useState<Contact>({ name: "", role: "", company: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<SubmitState>("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // CTAs elsewhere on the page pre-answer step 1; the visitor still confirms it.
  useEffect(() => {
    const apply = (event: Event) => {
      const { moment, interest } = (event as CustomEvent<V2Preselect>).detail;
      setAnswers((current) => ({ ...current, ...(moment ? { moment } : {}), ...(interest ? { interest } : {}) }));
      setStep(1);
    };
    window.addEventListener(V2_PRESELECT_EVENT, apply);
    return () => window.removeEventListener(V2_PRESELECT_EVENT, apply);
  }, []);

  useEffect(() => {
    if (state === "sent") doneRef.current?.focus();
  }, [state]);

  const focusFirst = (selector: string) => formRef.current?.querySelector<HTMLElement>(selector)?.focus();

  const toContact = () => {
    const next = { moment: !answers.moment, interest: !answers.interest, size: !answers.size };
    setErrors(next);
    const firstBad = (Object.keys(next) as (keyof typeof next)[]).find((key) => next[key]);
    if (firstBad) {
      focusFirst(firstBad === "size" ? "#v2-size" : `input[name="${firstBad}"]`);
      return;
    }
    setStep(2);
    requestAnimationFrame(() => focusFirst("#v2-name"));
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = Object.fromEntries(contactFields.map((field) => [field.key, !field.valid(contact[field.key].trim())]));
    setErrors(next);
    const firstBad = contactFields.find((field) => next[field.key]);
    if (firstBad) {
      focusFirst(`#v2-${firstBad.key}`);
      return;
    }
    setState("sending");
    const result = await createInboundLead(toPayload(answers, contact));
    if (result.success) {
      trackFormLead({ placement: "lead_form" });
      setState("sent");
      return;
    }
    setState(result.duplicateCompany ? "duplicate" : "error");
  };

  const firstName = contact.name.trim().split(" ")[0] || "Anda";
  const whatsappAfter = `${WHATSAPP_URL}?text=${encodeURIComponent("Halo Ailene, saya baru mengisi formulir konsultasi.")}`;

  return (
    <section id={V2_FORM_ANCHOR} aria-labelledby="v2-book" className={`${V2_SECTION} bg-v2-paper-2`}>
      <div className={`${V2_WRAP} grid items-start gap-[clamp(32px,5vw,72px)] min-[960px]:grid-cols-[5fr_7fr]`}>
        <div>
          <h2 id="v2-book" className={V2_H2}>
            Konsultasi kesiapan AI, 20 menit.
          </h2>
          <p className={`${V2_LEAD} mt-5`}>Gratis, tanpa kewajiban. Dipandu AI Adoption Consultant kami lewat panggilan video atau WhatsApp.</p>
          <ol aria-label="Isi konsultasi" className="mt-7 border-t border-v2-rule">
            {agenda.map(([time, title, body]) => (
              <li key={title} className="grid grid-cols-[64px_1fr] gap-3.5 border-b border-v2-rule py-4">
                <span className="font-extrabold tabular-nums">{time}</span>
                <span className="text-v2-ink-2">
                  <b className="block text-v2-ink">{title}</b>
                  {body}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-5.5 text-sm text-v2-ink-2">
            Setelah konsultasi, Anda menerima AI Vision Board: ringkasan satu halaman berisi kondisi AI perusahaan Anda dan langkah pertama yang disarankan.
          </p>
        </div>

        <div className="rounded-2xl border border-v2-rule bg-white p-[clamp(22px,3vw,36px)] text-v2-ink shadow-[0_24px_48px_-28px_rgb(10_32_22/0.45),0_2px_6px_-2px_rgb(10_32_22/0.12)]">
          {state === "sent" ? (
            <div ref={doneRef} tabIndex={-1} aria-live="polite" className="outline-none">
              <span className="mb-4 inline-flex items-center rounded-md bg-v2-lime px-2.75 py-1 text-[0.78rem] font-extrabold text-v2-forest">Terkirim</span>
              <h3 className="font-jakarta text-[1.7rem] font-extrabold tracking-[-0.035em]">Terima kasih, {firstName}.</h3>
              <p className="mt-3 text-v2-ink-2">AI Adoption Consultant kami akan menghubungi Anda lewat WhatsApp untuk memilih waktu konsultasi.</p>
              <p className="mt-5">
                <a
                  href={whatsappAfter}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsAppLead({ placement: "lead_form" })}
                  className={`${V2_TEXT_LINK} inline-flex items-center gap-2`}
                >
                  <IconBrandWhatsapp size={20} aria-hidden="true" />
                  Ingin lebih cepat? Kirim WhatsApp sekarang
                </a>
              </p>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={submit} aria-label="Formulir konsultasi">
              <div aria-hidden="true" className="mb-5.5 flex items-center gap-2 text-[0.84rem] font-bold text-v2-ink-3">
                {(["Kebutuhan", "Kontak"] as const).map((label, index) => {
                  const number = index + 1;
                  const current = step === number;
                  const done = step > number;
                  return (
                    <span key={label} className="contents">
                      {index > 0 && <hr className="m-0 flex-1 border-0 border-t-[1.5px] border-v2-rule" />}
                      <span className={`inline-flex items-center gap-2 ${current ? "text-v2-ink" : ""}`}>
                        <i
                          className={`inline-grid size-6 place-items-center rounded-full border-[1.5px] text-[0.75rem] not-italic ${
                            current ? "border-v2-forest bg-v2-forest text-v2-on-forest" : done ? "border-v2-green-soft bg-v2-green-soft text-v2-green" : "border-v2-rule"
                          }`}
                        >
                          {number}
                        </i>
                        {label}
                      </span>
                    </span>
                  );
                })}
              </div>
              <p className="sr-only" aria-live="polite">
                Langkah {step} dari 2
              </p>

              {step === 1 ? (
                <div>
                  <fieldset aria-describedby="v2-err-moment">
                    <legend className="mb-3 text-[1.05rem] font-extrabold tracking-[-0.01em]">Apa yang paling mendorong Anda saat ini?</legend>
                    <div className="grid gap-2">
                      {triggerMoments.map((moment) => (
                        <Choice
                          key={moment.value}
                          name="moment"
                          value={moment.value}
                          label={moment.label}
                          checked={answers.moment === moment.value}
                          onChange={() => {
                            setAnswers({ ...answers, moment: moment.value });
                            setErrors({ ...errors, moment: false });
                          }}
                        />
                      ))}
                    </div>
                    <ErrorText id="v2-err-moment" show={!!errors.moment}>
                      Pilih satu yang paling mendekati.
                    </ErrorText>
                  </fieldset>
                  <fieldset aria-describedby="v2-err-interest" className="mt-6.5">
                    <legend className="mb-3 text-[1.05rem] font-extrabold tracking-[-0.01em]">Layanan yang paling relevan</legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {serviceInterests.map((interest) => (
                        <Choice
                          key={interest.value}
                          name="interest"
                          value={interest.value}
                          label={interest.label}
                          hint={interest.hint}
                          checked={answers.interest === interest.value}
                          onChange={() => {
                            setAnswers({ ...answers, interest: interest.value });
                            setErrors({ ...errors, interest: false });
                          }}
                        />
                      ))}
                    </div>
                    <ErrorText id="v2-err-interest" show={!!errors.interest}>
                      Pilih satu, atau &ldquo;Belum tahu&rdquo;.
                    </ErrorText>
                  </fieldset>
                  <div className="mt-6.5">
                    <label htmlFor="v2-size" className="mb-1.5 block text-[0.9rem] font-bold">
                      Jumlah karyawan
                    </label>
                    <select
                      id="v2-size"
                      value={answers.size}
                      aria-invalid={!!errors.size}
                      aria-describedby="v2-err-size"
                      onChange={(event) => {
                        setAnswers({ ...answers, size: event.target.value });
                        setErrors({ ...errors, size: false });
                      }}
                      className={inputClass}
                    >
                      <option value="">Pilih</option>
                      {companySizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                    <ErrorText id="v2-err-size" show={!!errors.size}>
                      Pilih jumlah karyawan.
                    </ErrorText>
                  </div>
                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm text-v2-ink-3">Langkah 1 dari 2</span>
                    <AppButton type="button" variant="forestV2" size="cta" onClick={toContact}>
                      Lanjut ke kontak
                    </AppButton>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {contactFields.map((field) => (
                      <div key={field.key} className={field.wide ? "sm:col-span-2" : ""}>
                        <label htmlFor={`v2-${field.key}`} className="mb-1.5 block text-[0.9rem] font-bold">
                          {field.label}
                        </label>
                        <input
                          id={`v2-${field.key}`}
                          name={field.key}
                          type={field.type ?? "text"}
                          autoComplete={field.autoComplete}
                          placeholder={field.placeholder}
                          maxLength={field.key === "phone" ? 64 : 255}
                          value={contact[field.key]}
                          aria-invalid={!!errors[field.key]}
                          aria-describedby={`v2-err-${field.key}`}
                          onChange={(event) => {
                            setContact({ ...contact, [field.key]: event.target.value });
                            if (errors[field.key]) setErrors({ ...errors, [field.key]: false });
                          }}
                          className={inputClass}
                        />
                        <ErrorText id={`v2-err-${field.key}`} show={!!errors[field.key]}>
                          {field.error}
                        </ErrorText>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4.5 text-[0.82rem] leading-normal text-v2-ink-3">
                    Data Anda hanya kami pakai untuk menghubungi Anda soal konsultasi ini, sesuai UU PDP.
                  </p>
                  {state === "duplicate" && (
                    <p role="status" className="mt-4.5 rounded-[10px] bg-v2-green-soft px-4 py-3.5 text-[0.92rem] text-v2-ink-2">
                      Data perusahaan Anda sudah pernah kami terima. Tim kami akan menindaklanjuti lewat kontak yang sudah ada.
                    </p>
                  )}
                  {state === "error" && (
                    <p role="alert" className="mt-4.5 rounded-[10px] bg-v2-red-soft px-4 py-3.5 text-[0.92rem] font-semibold text-v2-red">
                      Formulir belum terkirim. Coba kirim lagi, atau hubungi kami lewat{" "}
                      <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppLead({ placement: "lead_form" })} className="underline">
                        WhatsApp di {siteProfile.phone}
                      </a>
                      .
                    </p>
                  )}
                  <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                    <AppButton
                      type="button"
                      variant="outlineV2"
                      size="cta"
                      onClick={() => {
                        setStep(1);
                        requestAnimationFrame(() => focusFirst('input[name="moment"]:checked'));
                      }}
                    >
                      Kembali
                    </AppButton>
                    <AppButton type="submit" variant="forestV2" size="cta" disabled={state === "sending"} aria-busy={state === "sending"}>
                      {state === "sending" && <IconLoader2 size={18} aria-hidden="true" className="animate-spin" />}
                      {state === "sending" ? "Mengirim" : "Kirim dan jadwalkan"}
                    </AppButton>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
