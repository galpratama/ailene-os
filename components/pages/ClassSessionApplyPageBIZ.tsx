"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppTextArea from "@/components/fields/AppTextArea";
import SessionDifficultyLabel from "@/components/labels/SessionDifficultyLabel";
import FooterBIZ from "@/components/navigations/FooterBIZ";
import HeaderBIZ from "@/components/navigations/HeaderBIZ";
import { trpc } from "@/trpc/client";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

export default function ClassSessionApplyPageBIZ({
  sessionId,
}: {
  sessionId: number;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [website, setWebsite] = useState("");

  const { data, isLoading, isError } = trpc.read.b2bClass.sessionPublic.useQuery(
    { id: sessionId }
  );
  const apply = trpc.create.b2bClass.publicApply.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (mutationError) => setError(mutationError.message),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!email.trim()) {
      return setError("Email wajib diisi.");
    }
    apply.mutate({
      session_id: sessionId,
      email: email.trim(),
      notes: notes.trim() || null,
      website,
    });
  }

  return (
    <div className="min-h-screen bg-off text-ink">
      <HeaderBIZ />
      <main>
        <section className="mx-auto max-w-160 px-7 py-16">
          {isLoading && (
            <p className="py-10 text-center text-sm text-ink-soft">
              Memuat sesi...
            </p>
          )}
          {(isError || (!isLoading && !data)) && (
            <div className="rounded-2xl border border-ink-line bg-white p-10 text-center">
              <h2 className="text-xl font-extrabold">
                Sesi ini tidak ditemukan atau sudah tidak menerima aplikasi.
              </h2>
            </div>
          )}
          {data && !submitted && (
            <>
              <div className="mb-8">
                <p className="text-sm font-bold text-oranye">
                  {data.session.class_name}
                </p>
                <h1 className="mt-1 text-3xl font-extrabold">
                  {data.session.name}
                </h1>
                <div className="mt-3 flex items-center gap-2">
                  <SessionDifficultyLabel difficulty={data.session.difficulty} />
                  {data.session.session_date && (
                    <span className="text-xs text-ink-soft">
                      {new Date(data.session.session_date).toLocaleDateString(
                        "id-ID"
                      )}
                    </span>
                  )}
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-5 rounded-2xl border border-ink-line bg-white p-6 sm:p-8"
              >
                {error && (
                  <p className="rounded-lg border border-merah/30 bg-merah-t px-4 py-3 text-sm text-merah">
                    {error}
                  </p>
                )}
                <AppInput
                  inputId="apply-email"
                  label="Email trainer terdaftar"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@email.com"
                />
                <AppTextArea
                  textAreaId="apply-notes"
                  label="Catatan tambahan (opsional)"
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Ketersediaan, pengalaman relevan, dsb."
                />
                <div className="absolute -left-250" aria-hidden="true">
                  <AppInput
                    inputId="apply-website"
                    label="Website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={website}
                    onChange={(event) => setWebsite(event.target.value)}
                  />
                </div>
                <AppButton
                  type="submit"
                  variant="ink"
                  size="cta"
                  className="justify-center"
                  disabled={apply.isPending}
                >
                  {apply.isPending ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <ArrowRight size={17} />
                  )}
                  Apply ke sesi ini
                </AppButton>
                <p className="text-xs text-ink-soft">
                  Belum terdaftar sebagai trainer? Daftar dulu di halaman{" "}
                  <a href="/join-trainer" className="font-semibold underline">
                    Join Trainer Pool
                  </a>
                  .
                </p>
              </form>
            </>
          )}
          {submitted && (
            <div className="rounded-2xl border border-ink-line bg-white p-10 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-hijau-t text-hijau">
                <Check size={28} strokeWidth={3} />
              </div>
              <h2 className="mt-5 text-2xl font-extrabold">
                Aplikasimu sudah masuk.
              </h2>
              <p className="mx-auto mt-3 max-w-130 leading-relaxed text-ink-soft">
                Tim Ailene akan menghubungimu jika kamu terpilih untuk sesi ini.
              </p>
            </div>
          )}
        </section>
      </main>
      <FooterBIZ />
    </div>
  );
}
