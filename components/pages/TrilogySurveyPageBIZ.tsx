"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppTextArea from "@/components/fields/AppTextArea";
import { LogoAilene } from "@/components/svg/LogoAilene";
import { submitTrilogySurvey } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import {
  EMPTY_TRILOGY_ANSWER,
  isTrilogyAnswerComplete,
  isValidEmail,
  normalizeTrilogyAnswers,
  TRILOGY_SURVEY_IDENTITY_MAX,
  TRILOGY_SURVEY_QUESTIONS,
  TRILOGY_SURVEY_SCALE,
  TRILOGY_SURVEY_TEXT_MAX,
  TRILOGY_SURVEY_TITLE,
  type TrilogySurveyAnswer,
  type TrilogySurveyAnswers,
  type TrilogySurveyIdentity,
  type TrilogySurveyQuestion,
} from "@/lib/trilogy-survey";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, Clock3, ListChecks, Loader2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type Ref } from "react";

const DRAFT_KEY = "trilogy-survey-draft";
// Step 0 is the identity form; step N is question N.
const LAST_STEP = TRILOGY_SURVEY_QUESTIONS.length;
const OTHER_TEXT_MAX = 200;

const EMPTY_IDENTITY: TrilogySurveyIdentity = { name: "", email: "", job_title: "" };

type Phase = "intro" | "form" | "done";
type Draft = { identity: TrilogySurveyIdentity; answers: TrilogySurveyAnswers; step: number };
type IdentityErrors = Partial<Record<keyof TrilogySurveyIdentity, string>>;

// Public page with no account, so an unsent draft lives in this browser only.
function readDraft(): Draft | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Partial<Draft>;
    const identity = { ...EMPTY_IDENTITY };
    for (const key of Object.keys(EMPTY_IDENTITY) as (keyof TrilogySurveyIdentity)[]) {
      const value = draft.identity?.[key];
      if (typeof value === "string") identity[key] = value;
    }
    const step = Number(draft.step);
    return {
      identity,
      answers: normalizeTrilogyAnswers(draft.answers),
      step: Number.isInteger(step) ? Math.min(Math.max(step, 0), LAST_STEP) : 0,
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft | null) {
  try {
    if (draft) window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage can be blocked (private mode); the form still works without a draft.
  }
}

function hasContent(draft: Draft) {
  return (
    Object.values(draft.identity).some((value) => value.trim()) ||
    Object.values(draft.answers).some((answer) => answer.choices.length > 0 || answer.text.trim())
  );
}

function identityErrors(identity: TrilogySurveyIdentity): IdentityErrors {
  const errors: IdentityErrors = {};
  if (!identity.name.trim()) errors.name = "Nama wajib diisi.";
  if (!identity.email.trim()) errors.email = "Email wajib diisi.";
  else if (!isValidEmail(identity.email)) errors.email = "Format email belum benar.";
  if (!identity.job_title.trim()) errors.job_title = "Job title wajib diisi.";
  return errors;
}

function toggleChoice(
  question: TrilogySurveyQuestion,
  answer: TrilogySurveyAnswer,
  value: string
): TrilogySurveyAnswer {
  const option =
    question.type === "single" || question.type === "multi"
      ? question.options.find((o) => o.value === value)
      : undefined;
  if (question.type !== "multi") {
    return { choices: [value], text: option?.other ? answer.text : "" };
  }

  if (answer.choices.includes(value)) {
    return {
      choices: answer.choices.filter((c) => c !== value),
      text: option?.other ? "" : answer.text,
    };
  }
  if (option?.exclusive) return { choices: [value], text: "" };

  const exclusive = new Set(question.options.filter((o) => o.exclusive).map((o) => o.value));
  return {
    choices: [...answer.choices.filter((c) => !exclusive.has(c)), value],
    text: answer.text,
  };
}

function questionError(question: TrilogySurveyQuestion, answer: TrilogySurveyAnswer): string {
  if (question.type === "text") return "Jawaban ini wajib diisi.";
  if (answer.choices.length > 0) return "Sebutkan jawaban “Lainnya” kamu.";
  return question.type === "multi" ? "Pilih minimal satu jawaban." : "Pilih salah satu jawaban.";
}

export default function TrilogySurveyPageBIZ() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [identity, setIdentity] = useState(EMPTY_IDENTITY);
  const [answers, setAnswers] = useState<TrilogySurveyAnswers>({});
  const [website, setWebsite] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const submit = useMutation({
    mutationFn: async () =>
      requireApiData(await submitTrilogySurvey({ identity, answers, website })),
    onSuccess: () => {
      writeDraft(null);
      setPhase("done");
    },
    onError: (error) => showErrorToast(error, "Gagal mengirim jawaban. Coba lagi."),
  });

  useEffect(() => {
    const draft = readDraft();
    if (draft && hasContent(draft)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIdentity(draft.identity);
      setAnswers(draft.answers);
      setStep(draft.step);
      setHasDraft(true);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded && phase !== "done") writeDraft({ identity, answers, step });
  }, [loaded, phase, identity, answers, step]);

  // Each step starts at the top, with focus on its question for screen readers.
  useEffect(() => {
    if (phase !== "form") return;
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [phase, step]);

  if (phase === "intro") {
    return <TrilogySurveyIntroBIZ hasDraft={hasDraft} onStart={() => setPhase("form")} />;
  }
  if (phase === "done") return <TrilogySurveyDoneBIZ name={identity.name} />;

  const question = step > 0 ? TRILOGY_SURVEY_QUESTIONS[step - 1] : null;
  const answer = question ? (answers[question.id] ?? EMPTY_TRILOGY_ANSWER) : EMPTY_TRILOGY_ANSWER;
  const errors = identityErrors(identity);
  const stepComplete = question
    ? isTrilogyAnswerComplete(question, answer)
    : Object.keys(errors).length === 0;
  const progressPct = Math.round(((step + 1) / (LAST_STEP + 1)) * 100);

  function handleNext(event: FormEvent) {
    event.preventDefault();
    if (submit.isPending) return;
    if (!stepComplete) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (step < LAST_STEP) {
      setStep((s) => s + 1);
      return;
    }
    // A restored draft can predate a question change, so recheck everything before sending.
    const firstIncomplete = TRILOGY_SURVEY_QUESTIONS.findIndex(
      (q) => !isTrilogyAnswerComplete(q, answers[q.id])
    );
    if (firstIncomplete !== -1) {
      setStep(firstIncomplete + 1);
      setShowErrors(true);
      return;
    }
    submit.mutate();
  }

  function handleBack() {
    setShowErrors(false);
    if (step === 0) setPhase("intro");
    else setStep((s) => s - 1);
  }

  return (
    <form noValidate onSubmit={handleNext} className="flex min-h-dvh flex-col bg-off text-ink">
      <header className="sticky top-0 z-10 border-b border-ink-line bg-off/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl items-center justify-between gap-3 px-5 py-3">
          <LogoAilene className="h-5 w-auto text-ink" />
          <span className="text-xs font-medium tabular-nums text-ink-soft">
            {question ? `Pertanyaan ${step} dari ${TRILOGY_SURVEY_QUESTIONS.length}` : "Data diri"}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Progres survei"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPct}
          className="h-1 w-full bg-ink-line"
        >
          <div
            className="h-full rounded-full bg-claude transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 py-7 sm:py-12">
        {question ? (
          <QuestionStepBIZ
            key={question.id}
            number={step}
            question={question}
            answer={answer}
            headingRef={headingRef}
            error={showErrors ? questionError(question, answer) : undefined}
            onChange={(next) => setAnswers((prev) => ({ ...prev, [question.id]: next }))}
          />
        ) : (
          <IdentityStepBIZ
            identity={identity}
            errors={showErrors ? errors : {}}
            headingRef={headingRef}
            website={website}
            onWebsiteChange={setWebsite}
            onChange={(field, value) => setIdentity((prev) => ({ ...prev, [field]: value }))}
          />
        )}
      </main>

      <footer className="sticky bottom-0 border-t border-ink-line bg-off/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-xl gap-3 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <AppButton
            type="button"
            variant="white"
            size="cta"
            aria-label="Kembali"
            className="shrink-0"
            onClick={handleBack}
            disabled={submit.isPending}
          >
            <ArrowLeft size={18} />
          </AppButton>
          <AppButton
            type="submit"
            variant="forest"
            size="cta"
            className="w-full"
            disabled={submit.isPending}
          >
            {submit.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Mengirim...
              </>
            ) : step === LAST_STEP ? (
              "Kirim Jawaban"
            ) : (
              <>
                Lanjut
                <ArrowRight size={18} />
              </>
            )}
          </AppButton>
        </div>
      </footer>
    </form>
  );
}

function TrilogySurveyIntroBIZ({ hasDraft, onStart }: { hasDraft: boolean; onStart: () => void }) {
  const points = [
    {
      icon: ListChecks,
      title: `${TRILOGY_SURVEY_QUESTIONS.length} pertanyaan, satu per layar`,
      desc: "Tools dan kebiasaanmu memakai AI, beberapa skenario kerja, dan satu latihan singkat menulis prompt.",
    },
    {
      icon: Clock3,
      title: "Sekitar 5–7 menit",
      desc: "Jawabanmu tersimpan sementara di browser ini sampai kamu kirim.",
    },
    {
      icon: ShieldCheck,
      title: "Jawab sesuai kondisimu sekarang",
      desc: "Tidak ada lulus atau gagal. Jawaban yang jujur membantu kami menyiapkan materi yang paling pas.",
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col bg-off text-ink">
      <header className="mx-auto w-full max-w-xl px-5 pt-5">
        <LogoAilene className="h-6 w-auto text-ink" />
      </header>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-7 px-5 pt-9 pb-10 sm:pt-16">
        <div className="flex flex-col gap-3">
          <span className="w-fit rounded-full bg-biz-lime/40 px-3 py-1 text-xs font-bold text-biz-forest">
            Trilogy · AI Survey
          </span>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {TRILOGY_SURVEY_TITLE}
          </h1>
          <p className="text-base leading-relaxed text-ink-soft">
            Bantu kami memahami tools AI yang kamu pakai, untuk apa kamu memakainya sehari-hari, dan
            sejauh mana kemampuanmu saat ini.
          </p>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-ink-line bg-white p-4">
          <Image
            src="/biz/logo-cfte.webp"
            alt="CFTE"
            width={56}
            height={56}
            className="size-14 shrink-0 rounded-xl"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold">Mengacu pada CFTE AI Proficiency Framework</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              CFTE (Centre for Finance, Technology and Entrepreneurship) adalah lembaga pendidikan
              global berbasis di London untuk teknologi, keuangan, dan AI. Pertanyaan kemampuan di
              survei ini disusun mengacu pada kerangka AI Proficiency mereka.
            </p>
          </div>
        </div>

        <ul className="flex flex-col gap-4">
          {points.map((point) => (
            <li key={point.title} className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-lime-bright text-forest-deep">
                <point.icon size={18} strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">{point.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">{point.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-2">
          <AppButton type="button" variant="forest" size="cta" className="w-full" onClick={onStart}>
            {hasDraft ? "Lanjutkan Survei" : "Mulai Survei"}
            <ArrowRight size={18} />
          </AppButton>
        </div>
      </main>
    </div>
  );
}

function TrilogySurveyDoneBIZ({ name }: { name: string }) {
  const firstName = name.trim().split(" ")[0];
  return (
    <div className="flex min-h-dvh items-center justify-center bg-off px-5 text-ink">
      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-lime-bright text-forest-deep">
          <Check size={28} strokeWidth={3} />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold">
          Terima kasih{firstName ? `, ${firstName}` : ""}!
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Jawabanmu sudah kami terima. Hasilnya kami pakai untuk menyesuaikan materi program dengan
          kebutuhanmu. Kamu boleh menutup halaman ini.
        </p>
      </div>
    </div>
  );
}

function StepHeadingBIZ({
  eyebrow,
  title,
  hint,
  id,
  headingRef,
}: {
  eyebrow: string;
  title: string;
  hint?: string;
  id?: string;
  headingRef: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-bold uppercase tracking-wide text-claude">{eyebrow}</p>
      <h1
        ref={headingRef}
        id={id}
        tabIndex={-1}
        className="text-xl font-extrabold leading-snug tracking-tight outline-none sm:text-2xl"
      >
        {title}
      </h1>
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
    </div>
  );
}

function IdentityStepBIZ({
  identity,
  errors,
  headingRef,
  website,
  onWebsiteChange,
  onChange,
}: {
  identity: TrilogySurveyIdentity;
  errors: IdentityErrors;
  headingRef: Ref<HTMLHeadingElement>;
  website: string;
  onWebsiteChange: (value: string) => void;
  onChange: (field: keyof TrilogySurveyIdentity, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <StepHeadingBIZ
        eyebrow="Sebelum mulai"
        title="Kenalan dulu, yuk"
        hint="Kami pakai data ini untuk mengenali jawabanmu sebagai peserta program."
        headingRef={headingRef}
      />
      <div className="flex flex-col gap-4 rounded-2xl border border-ink-line bg-white p-5">
        <AppInput
          inputId="trilogy-name"
          label="Nama lengkap"
          required
          autoComplete="name"
          placeholder="Nama kamu"
          value={identity.name}
          characterLength={TRILOGY_SURVEY_IDENTITY_MAX}
          errorMessage={errors.name}
          onChange={(event) => onChange("name", event.target.value)}
        />
        <AppInput
          inputId="trilogy-email"
          label="Email"
          type="email"
          inputMode="email"
          required
          autoComplete="email"
          placeholder="nama@perusahaan.com"
          value={identity.email}
          characterLength={TRILOGY_SURVEY_IDENTITY_MAX}
          errorMessage={errors.email}
          onChange={(event) => onChange("email", event.target.value)}
        />
        <AppInput
          inputId="trilogy-job-title"
          label="Job title"
          required
          autoComplete="organization-title"
          placeholder="Contoh: HR Manager"
          value={identity.job_title}
          characterLength={TRILOGY_SURVEY_IDENTITY_MAX}
          errorMessage={errors.job_title}
          onChange={(event) => onChange("job_title", event.target.value)}
        />
        <div className="absolute -left-250" aria-hidden="true">
          <AppInput
            inputId="trilogy-website"
            label="Website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => onWebsiteChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function QuestionStepBIZ({
  number,
  question,
  answer,
  error,
  headingRef,
  onChange,
}: {
  number: number;
  question: TrilogySurveyQuestion;
  answer: TrilogySurveyAnswer;
  error?: string;
  headingRef: Ref<HTMLHeadingElement>;
  onChange: (answer: TrilogySurveyAnswer) => void;
}) {
  const headingId = `trilogy-question-${question.id}`;

  return (
    <div className="flex flex-col gap-6">
      <StepHeadingBIZ
        eyebrow={`Pertanyaan ${number}${question.optional ? " · Opsional" : ""}`}
        title={question.title}
        hint={question.hint}
        id={headingId}
        headingRef={headingRef}
      />

      {(question.type === "single" || question.type === "multi") && (
        <ChoiceListBIZ question={question} answer={answer} headingId={headingId} onChange={onChange} />
      )}

      {question.type === "scale" && (
        <div className="flex flex-col gap-2">
          <div role="group" aria-labelledby={headingId} className="grid grid-cols-5 gap-2">
            {TRILOGY_SURVEY_SCALE.map((value) => {
              const selected = answer.choices[0] === value;
              return (
                <AppButton
                  key={value}
                  type="button"
                  variant={selected ? "choiceBizActive" : "choiceBiz"}
                  size="rating"
                  aria-pressed={selected}
                  aria-label={`${value} dari 5`}
                  onClick={() => onChange(toggleChoice(question, answer, value))}
                >
                  {value}
                </AppButton>
              );
            })}
          </div>
          <div className="flex justify-between gap-4 text-xs text-ink-soft">
            <span>{question.minLabel}</span>
            <span className="text-right">{question.maxLabel}</span>
          </div>
        </div>
      )}

      {question.type === "text" && (
        <div className="flex flex-col gap-1">
          <AppTextArea
            textAreaId={`trilogy-answer-${question.id}`}
            aria-labelledby={headingId}
            placeholder={question.placeholder}
            rows={question.rows ?? 5}
            characterLength={TRILOGY_SURVEY_TEXT_MAX}
            className="bg-white text-base sm:text-sm"
            value={answer.text}
            onChange={(event) => onChange({ ...answer, text: event.target.value })}
          />
          <span className="self-end text-xs tabular-nums text-ink-soft">
            {answer.text.length} / {TRILOGY_SURVEY_TEXT_MAX}
          </span>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function ChoiceListBIZ({
  question,
  answer,
  headingId,
  onChange,
}: {
  question: Extract<TrilogySurveyQuestion, { type: "single" | "multi" }>;
  answer: TrilogySurveyAnswer;
  headingId: string;
  onChange: (answer: TrilogySurveyAnswer) => void;
}) {
  const multi = question.type === "multi";
  const otherSelected = question.options.some(
    (option) => option.other && answer.choices.includes(option.value)
  );

  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-labelledby={headingId} className="flex flex-col gap-2">
        {question.options.map((option, idx) => {
          const selected = answer.choices.includes(option.value);
          return (
            <AppButton
              key={option.value}
              type="button"
              variant={selected ? "choiceBizActive" : "choiceBiz"}
              size="choice"
              aria-pressed={selected}
              onClick={() => onChange(toggleChoice(question, answer, option.value))}
            >
              {multi ? (
                <span
                  aria-hidden="true"
                  className={`flex size-5 shrink-0 items-center justify-center rounded-lg border ${
                    selected ? "border-biz-forest bg-biz-forest text-white" : "border-ink/25 bg-white"
                  }`}
                >
                  {selected && <Check size={13} strokeWidth={3} />}
                </span>
              ) : (
                <span
                  aria-hidden="true"
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    selected ? "bg-biz-forest text-white" : "border border-ink-line bg-off text-ink-soft"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </span>
              )}
              <span className="flex-1">{option.label}</span>
            </AppButton>
          );
        })}
      </div>

      {otherSelected && (
        <AppInput
          inputId={`trilogy-other-${question.id}`}
          label="Sebutkan lainnya"
          required
          autoFocus
          placeholder="Tulis singkat"
          characterLength={OTHER_TEXT_MAX}
          className="bg-white text-base sm:text-sm"
          value={answer.text}
          onChange={(event) => onChange({ ...answer, text: event.target.value })}
        />
      )}
    </div>
  );
}
