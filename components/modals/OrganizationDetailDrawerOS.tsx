"use client";

import AppButton from "@/components/buttons/AppButton";
import StageLabel from "@/components/labels/StageLabel";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import SheetOS from "@/components/modals/SheetOS";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { deleteCompany, getCompanyDetails } from "@/lib/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Phone, Trash2, User } from "lucide-react";
import { useState } from "react";

export default function OrganizationDetailDrawerOS({
  sessionToken,
  organizationId,
  isOpen,
  onClose,
}: {
  sessionToken: string;
  organizationId: number | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detailsQuery = useQuery({
    queryKey: ["sales", "company", organizationId],
    queryFn: async () => requireApiData(await getCompanyDetails(organizationId!)),
    enabled: !!sessionToken && isOpen && organizationId !== null,
  });
  const deleteMutation = useMutation({
    mutationFn: async () => requireApiSuccess(await deleteCompany(organizationId!)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sales", "companies"] });
      setIsConfirmingDelete(false);
      onClose();
    },
    onError: (cause) => {
      setIsConfirmingDelete(false);
      setError(cause instanceof Error ? cause.message : "Failed to delete company.");
    },
  });

  const company = detailsQuery.data;
  const contacts = detailsQuery.data?.contacts ?? [];
  const primaryContact = contacts.find((contact) => contact.primary) ?? contacts[0];
  const pipeline = detailsQuery.data?.pipeline;
  const isReady = !detailsQuery.isLoading && !!company;

  return (
    <>
      <SheetOS title="Organization detail" description={company?.name} isOpen={isOpen} onClose={onClose}>
        {!isReady ? (
          <div className="flex flex-1 items-center justify-center py-20"><Loader2 size={20} className="animate-spin text-gray-400" /></div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400">Source</p><p className="capitalize text-gray-700 dark:text-zinc-300">{company.source}</p></div>
                <div><p className="text-xs text-gray-400">Industry ID</p><p className="text-gray-700 dark:text-zinc-300">{company.industry_id ?? "—"}</p></div>
                <div><p className="text-xs text-gray-400">Legal identifier</p><p className="text-gray-700 dark:text-zinc-300">{company.legal_identifier ?? "—"}</p></div>
                <div><p className="text-xs text-gray-400">Website</p><p className="break-all text-gray-700 dark:text-zinc-300">{company.website_url ?? "—"}</p></div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Primary contact</p>
                {primaryContact ? (
                  <div className="mt-2 flex flex-col gap-1.5 text-sm text-gray-600 dark:text-zinc-300">
                    <span className="inline-flex items-center gap-1.5"><User size={13} />{primaryContact.full_name}{primaryContact.job_title ? ` · ${primaryContact.job_title}` : ""}</span>
                    <span className="inline-flex items-center gap-1.5"><Mail size={13} />{primaryContact.email ?? "—"}</span>
                    <span className="inline-flex items-center gap-1.5"><Phone size={13} />{primaryContact.phone ?? "—"}</span>
                  </div>
                ) : <p className="mt-1 text-sm text-gray-400">No contact on file.</p>}
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">Pipeline</p>
                {pipeline ? <div className="mt-2 flex items-center justify-between gap-3"><StageLabel stage={pipeline.stage} /><span className="text-xs text-gray-500">{pipeline.sales_owner_name}</span></div> : <p className="mt-1 text-sm text-gray-400">No visible pipeline.</p>}
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
              <AppButton type="button" variant="outline" className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50" onClick={() => setIsConfirmingDelete(true)}><Trash2 size={14} />Delete company</AppButton>
            </div>
          </div>
        )}
      </SheetOS>
      <AlertConfirmationOS isOpen={isConfirmingDelete} onClose={() => setIsConfirmingDelete(false)} onConfirm={() => deleteMutation.mutate()} title="Delete this company?" message="Java API only permits deletion after its contacts and pipeline have been removed." confirmLabel="Delete" destructive isPending={deleteMutation.isPending} />
    </>
  );
}
