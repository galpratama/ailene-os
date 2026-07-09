"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import { trpc } from "@/trpc/client";
import type { TrainerSourceEnum } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const sourceOptions: AppSelectOption[] = [
  { value: "AI_COMMUNITY", label: "AI Community" },
  { value: "TOP_ALUMNI", label: "Top Alumni" },
  { value: "DOMAIN_PRACTITIONER", label: "Domain Practitioner" },
  { value: "TRAINER_NETWORK", label: "Trainer Network" },
  { value: "CORPORATE_PRACTITIONER", label: "Corporate Practitioner" },
  { value: "INTERNAL_REFERRAL", label: "Internal Referral" },
];

export default function CreateTrainerFormOS({
  sessionToken,
  isOpen,
  onClose,
}: {
  sessionToken: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const utils = trpc.useUtils();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountryId, setPhoneCountryId] = useState<number | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [source, setSource] = useState<TrainerSourceEnum | "">("");
  const [specializationIds, setSpecializationIds] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: optionsData } =
    trpc.list.trainerPool.applicationOptions.useQuery(undefined, {
      enabled: !!sessionToken && isOpen,
    });
  const phoneOptions: AppSelectOption[] =
    optionsData?.phone_countries.map((country) => ({
      value: country.id,
      label: `${country.emoji} ${country.phone_code} · ${country.name}`,
    })) ?? [];

  function reset() {
    setFullName("");
    setEmail("");
    setPhoneCountryId(null);
    setPhoneNumber("");
    setSource("");
    setSpecializationIds([]);
    setNotes("");
    setError(null);
  }

  function close() {
    reset();
    onClose();
  }

  const createTrainer = trpc.create.trainerPool.trainer.useMutation({
    onSuccess: () => {
      utils.list.trainerPool.trainers.invalidate();
      close();
    },
    onError: (mutationError) => setError(mutationError.message),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      return setError("Name and email are required.");
    }
    createTrainer.mutate({
      full_name: fullName.trim(),
      email: email.trim(),
      phone_country_id: phoneCountryId,
      phone_number: phoneNumber.trim() || null,
      source: source || null,
      specialization_ids: specializationIds,
      notes: notes.trim() || null,
    });
  }

  return (
    <SheetOS
      title="Add Candidate"
      description="Add a trainer recruited through an internal channel."
      isOpen={isOpen}
      onClose={close}
    >
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </p>
          )}
          <AppInput
            inputId="candidate-name"
            label="Full Name"
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
          <AppInput
            inputId="candidate-email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <AppSelect
              selectId="candidate-phone-country"
              label="Country Code"
              placeholder="Select"
              value={phoneCountryId}
              onChange={(value) =>
                setPhoneCountryId(value as number | null)
              }
              options={phoneOptions}
            />
            <AppInput
              inputId="candidate-phone"
              label="WhatsApp"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
            />
          </div>
          <AppSelect
            selectId="candidate-source"
            label="Source"
            placeholder="Select source"
            value={source}
            onChange={(value) =>
              setSource((value as TrainerSourceEnum) ?? "")
            }
            options={sourceOptions}
          />
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
              Specializations
            </legend>
            <div className="flex flex-col gap-2">
              {optionsData?.specializations.map((specialization) => (
                <label
                  key={specialization.id}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-zinc-700"
                >
                  <input
                    type="checkbox"
                    className="accent-claude"
                    checked={specializationIds.includes(specialization.id)}
                    onChange={() =>
                      setSpecializationIds((current) =>
                        current.includes(specialization.id)
                          ? current.filter((id) => id !== specialization.id)
                          : [...current, specialization.id]
                      )
                    }
                  />
                  {specialization.name}
                </label>
              ))}
            </div>
          </fieldset>
          <AppTextArea
            textAreaId="candidate-notes"
            label="Recruitment Notes"
            rows={5}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
        <div className="flex gap-3 border-t border-gray-200 px-6 py-4 dark:border-zinc-800">
          <AppButton
            type="button"
            variant="outline"
            className="flex-1 justify-center"
            onClick={close}
          >
            Cancel
          </AppButton>
          <AppButton
            type="submit"
            className="flex-1 justify-center"
            disabled={createTrainer.isPending}
          >
            {createTrainer.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Add Candidate
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
