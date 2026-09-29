"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppNumberInput from "@/components/fields/AppNumberInput";
import AppSelect, {
  type AppSelectOption,
} from "@/components/fields/AppSelect";
import AppTextArea from "@/components/fields/AppTextArea";
import SheetOS from "@/components/modals/SheetOS";
import type { TrainerSource } from "@/apis/trainers";
import { createTrainer, listSpecializationOptions } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

const sourceOptions: AppSelectOption[] = [
  { value: "ai_community", label: "AI Community" },
  { value: "top_alumni", label: "Top Alumni" },
  { value: "domain_practitioner", label: "Domain Practitioner" },
  { value: "trainer_network", label: "Trainer Network" },
  { value: "corporate_practitioner", label: "Corporate Practitioner" },
  { value: "internal_referral", label: "Internal Referral" },
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
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<TrainerSource | "">("");
  const [specializationIds, setSpecializationIds] = useState<number[]>([]);
  const [aiExperienceYears, setAiExperienceYears] = useState("");
  const [notes, setNotes] = useState("");

  const { data: optionsData } = useQuery({
    queryKey: ["trainer-specializations", "options"],
    queryFn: async () => requireApiData(await listSpecializationOptions()),
    enabled: !!sessionToken && isOpen,
  });

  function reset() {
    setFullName("");
    setEmail("");
    setPhone("");
    setSource("");
    setSpecializationIds([]);
    setAiExperienceYears("");
    setNotes("");
  }

  function close() {
    reset();
    onClose();
  }

  const createTrainerMutation = useMutation({
    mutationFn: async (payload: Parameters<typeof createTrainer>[0]) =>
      requireApiData(await createTrainer(payload)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["trainers"] });
      close();
    },
    onError: (error) => showErrorToast(error),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      return showErrorToast("Name and email are required.");
    }
    createTrainerMutation.mutate({
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      source: source || null,
      specialization_ids: specializationIds,
      ai_experience_years: aiExperienceYears ? Number(aiExperienceYears) : 0,
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
          <AppInput
            inputId="candidate-phone"
            label="WhatsApp"
            placeholder="+6285110545698"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <AppSelect
            selectId="candidate-source"
            label="Source"
            placeholder="Select source"
            value={source}
            onChange={(value) =>
              setSource((value as TrainerSource) ?? "")
            }
            options={sourceOptions}
          />
          <AppNumberInput
            inputId="candidate-ai-experience"
            label="AI Experience (years)"
            value={aiExperienceYears}
            onValueChange={setAiExperienceYears}
          />
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700 dark:text-zinc-300">
              Specializations
            </legend>
            <div className="flex flex-col gap-2">
              {optionsData?.list.map((specialization) => (
                <label
                  key={specialization.id}
                  className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm"
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
        <div className="flex gap-3 border-t border-line-soft px-6 py-4">
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
            disabled={createTrainerMutation.isPending}
          >
            {createTrainerMutation.isPending && (
              <Loader2 size={14} className="animate-spin" />
            )}
            Add Candidate
          </AppButton>
        </div>
      </form>
    </SheetOS>
  );
}
