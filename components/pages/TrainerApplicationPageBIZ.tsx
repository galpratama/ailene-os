"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import FooterBIZ from "@/components/navigations/FooterBIZ";
import HeaderBIZ from "@/components/navigations/HeaderBIZ";
import { trpc } from "@/trpc/client";
import type { TrainerSourceEnum } from "@prisma/client";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Loader2,
  Sparkles,
  Users,
} from "lucide-react";
import { FormEvent, useState } from "react";

const sourceOptions: AppSelectOption[] = [
  { value: "AI_COMMUNITY", label: "Komunitas AI" },
  { value: "TOP_ALUMNI", label: "Alumni program Ailene" },
  { value: "DOMAIN_PRACTITIONER", label: "Praktisi bidang tertentu" },
  { value: "TRAINER_NETWORK", label: "Network trainer" },
  { value: "CORPORATE_PRACTITIONER", label: "Praktisi korporat" },
  { value: "INTERNAL_REFERRAL", label: "Referensi tim Ailene" },
];

const levels = [
  ["Apprentice", "Belajar delivery bersama trainer senior"],
  ["Certified", "Siap memimpin kelas inti Ailene"],
  ["Senior", "Menangani topik advanced dan audience eksekutif"],
  ["Lead", "Menjaga standar, mentor, dan sertifikasi trainer"],
];

export default function TrainerApplicationPageBIZ() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryId, setPhoneCountryId] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [source, setSource] = useState<TrainerSourceEnum | "">("");
  const [specializationIds, setSpecializationIds] = useState<number[]>([]);
  const [teachingExperience, setTeachingExperience] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [aiUseCase, setAiUseCase] = useState("");
  const [availabilityNotes, setAvailabilityNotes] = useState("");
  const [website, setWebsite] = useState("");

  const { data: optionsData, isLoading: isLoadingOptions } =
    trpc.list.trainerPool.applicationOptions.useQuery();
  const apply = trpc.create.trainerPool.candidate.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (mutationError) => setError(mutationError.message),
  });

  const phoneOptions: AppSelectOption[] =
    optionsData?.phone_countries.map((country) => ({
      value: country.id,
      label: `${country.emoji} ${country.phone_code} · ${country.name}`,
    })) ?? [];

  function toggleSpecialization(id: number) {
    setSpecializationIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id]
    );
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim()) {
      return setError("Nama dan email wajib diisi.");
    }
    if (!teachingExperience.trim() || !aiUseCase.trim()) {
      return setError(
        "Ceritakan pengalaman mengajar dan satu contoh use case AI kamu."
      );
    }

    apply.mutate({
      full_name: fullName.trim(),
      email: email.trim(),
      phone_country_id: phoneCountryId,
      phone_number: phoneNumber.trim() || null,
      source: source || null,
      specialization_ids: specializationIds,
      teaching_experience: teachingExperience.trim(),
      portfolio_url: portfolioUrl.trim() || null,
      ai_use_case: aiUseCase.trim(),
      availability_notes: availabilityNotes.trim() || null,
      website,
    });
  }

  return (
    <div className="min-h-screen bg-off text-ink">
      <HeaderBIZ />
      <main>
        <section className="border-b border-ink-line bg-kuning-t">
          <div className="mx-auto grid max-w-280 gap-12 px-7 py-18 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink-line bg-white px-3 py-1.5 text-xs font-bold">
                <Sparkles size={14} className="text-oranye" />
                Ailene Trainer Pool
              </div>
              <h1 className="max-w-160 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Bantu tim Indonesia memakai AI, bukan cuma membicarakannya.
              </h1>
              <p className="mt-5 max-w-150 text-lg leading-relaxed text-ink-soft">
                Bergabung ke pool trainer freelance Ailene. Kamu akan melewati
                screening, pathway sertifikasi, lalu dipasangkan dengan project
                yang sesuai spesialisasi dan kesiapanmu.
              </p>
              <div className="mt-7 flex flex-wrap gap-5 text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Users size={17} /> Project sesuai demand
                </span>
                <span className="flex items-center gap-2">
                  <BadgeCheck size={17} /> Pathway sertifikasi jelas
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {levels.map(([title, description], index) => (
                <div
                  key={title}
                  className="rounded-2xl border border-ink-line bg-white p-5"
                >
                  <span className="text-xs font-bold text-oranye">
                    LEVEL {index + 1}
                  </span>
                  <h2 className="mt-1 text-lg font-extrabold">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-200 px-7 py-16">
          {submitted ? (
            <div className="rounded-2xl border border-ink-line bg-white p-10 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-hijau-t text-hijau">
                <Check size={28} strokeWidth={3} />
              </div>
              <h2 className="mt-5 text-2xl font-extrabold">
                Terima kasih, aplikasimu sudah masuk.
              </h2>
              <p className="mx-auto mt-3 max-w-130 leading-relaxed text-ink-soft">
                Tim Ailene akan meninjau profilmu dan menghubungi lewat email
                atau WhatsApp untuk tahap berikutnya.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm font-bold text-oranye">APPLICATION</p>
                <h2 className="mt-1 text-3xl font-extrabold">
                  Ceritakan sedikit tentang dirimu
                </h2>
                <p className="mt-2 text-ink-soft">
                  Tidak perlu sempurna. Kami mencari praktisi yang kuat,
                  komunikatif, dan mau terus belajar.
                </p>
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <AppInput
                    inputId="trainer-full-name"
                    label="Nama lengkap"
                    required
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nama kamu"
                  />
                  <AppInput
                    inputId="trainer-email"
                    label="Email"
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="nama@email.com"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <AppSelect
                    selectId="trainer-phone-country"
                    label="Kode negara"
                    placeholder={
                      isLoadingOptions ? "Memuat..." : "Pilih kode negara"
                    }
                    value={phoneCountryId}
                    onChange={(value) =>
                      setPhoneCountryId(value as number | null)
                    }
                    options={phoneOptions}
                  />
                  <AppInput
                    inputId="trainer-phone"
                    label="Nomor WhatsApp"
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="81234567890"
                  />
                </div>
                <AppSelect
                  selectId="trainer-source"
                  label="Kamu tahu program ini dari mana?"
                  placeholder="Pilih sumber"
                  value={source}
                  onChange={(value) =>
                    setSource((value as TrainerSourceEnum) ?? "")
                  }
                  options={sourceOptions}
                />

                <fieldset>
                  <legend className="mb-2 text-sm font-semibold text-gray-700">
                    Domain expertise
                  </legend>
                  {optionsData?.specializations.length ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {optionsData.specializations.map((specialization) => (
                        <label
                          key={specialization.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={specializationIds.includes(
                              specialization.id
                            )}
                            onChange={() =>
                              toggleSpecialization(specialization.id)
                            }
                            className="accent-claude"
                          />
                          {specialization.name}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                      Pilihan spesialisasi sedang disiapkan. Kamu tetap bisa
                      mendaftar dan menjelaskannya di pengalaman mengajar.
                    </p>
                  )}
                </fieldset>

                <AppTextArea
                  textAreaId="trainer-experience"
                  label="Pengalaman mengajar / memfasilitasi"
                  required
                  rows={4}
                  value={teachingExperience}
                  onChange={(event) =>
                    setTeachingExperience(event.target.value)
                  }
                  placeholder="Ceritakan audience, topik, dan format kelas yang pernah kamu bawakan."
                />
                <AppInput
                  inputId="trainer-portfolio"
                  label="Link portfolio / LinkedIn"
                  type="url"
                  value={portfolioUrl}
                  onChange={(event) => setPortfolioUrl(event.target.value)}
                  placeholder="https://"
                />
                <AppTextArea
                  textAreaId="trainer-ai-use-case"
                  label="Contoh use case AI yang pernah kamu kerjakan"
                  required
                  rows={4}
                  value={aiUseCase}
                  onChange={(event) => setAiUseCase(event.target.value)}
                  placeholder="Masalahnya apa, AI dipakai untuk apa, dan apa hasilnya?"
                />
                <AppTextArea
                  textAreaId="trainer-availability"
                  label="Ketersediaan kasar"
                  rows={3}
                  value={availabilityNotes}
                  onChange={(event) =>
                    setAvailabilityNotes(event.target.value)
                  }
                  placeholder="Contoh: weekday setelah 18.00, Sabtu fleksibel."
                />
                <div className="absolute -left-250" aria-hidden="true">
                  <AppInput
                    inputId="trainer-website"
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
                  Kirim aplikasi
                </AppButton>
              </form>
            </>
          )}
        </section>
      </main>
      <FooterBIZ />
    </div>
  );
}
