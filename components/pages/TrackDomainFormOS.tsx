"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import { trackDomain } from "@/lib/actions";
import { requireApiData } from "@/lib/api-result";
import { normalizeDomainLookup } from "@/lib/domain-ranking";
import { showErrorToast } from "@/lib/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function TrackDomainFormOS() {
  const [domain, setDomain] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (value: string) => requireApiData(await trackDomain(value)),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["domain-ranking"] });
      setDomain("");
      router.push(`/domain-ranking/${encodeURIComponent(result.domain)}`);
    },
    onError: (cause) => showErrorToast(cause, "Could not add domain to tracking."),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = normalizeDomainLookup(domain);
    if (!value) {
      setError("Enter a domain to track.");
      return;
    }
    setError("");
    mutation.mutate(value);
  }

  return (
    <section className="rounded-xl border border-line bg-card-bg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-zinc-100">Add a domain to track</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">
            Scores appear when a public ranking or authority source covers the domain and the scoring job runs.
          </p>
        </div>
        <form className="flex w-full flex-wrap items-start gap-2 sm:w-auto" onSubmit={submit}>
          <div className="min-w-0 flex-1 sm:w-64 sm:flex-none">
            <AppInput
              inputId="new-tracked-domain"
              aria-label="Domain to track"
              placeholder="example.com"
              value={domain}
              onChange={(event) => { setDomain(event.target.value); setError(""); }}
              errorMessage={error}
            />
          </div>
          <AppButton type="submit" disabled={mutation.isPending}>
            <Plus size={15} /> {mutation.isPending ? "Adding..." : "Add domain"}
          </AppButton>
        </form>
      </div>
    </section>
  );
}
