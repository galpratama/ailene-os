"use client";

import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import OrganizationStatusLabel from "@/components/labels/OrganizationStatusLabel";
import SheetOS from "@/components/modals/SheetOS";
import AppButton from "@/components/buttons/AppButton";
import RecordTimelineOS from "@/components/elements/RecordTimelineOS";
import { trpc } from "@/trpc/client";
import { Archive, Loader2, Mail, Phone, User } from "lucide-react";
import { useState } from "react";

interface OrganizationDetailDrawerOSProps {
  sessionToken: string;
  organizationId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrganizationDetailDrawerOS({
  sessionToken,
  organizationId,
  isOpen,
  onClose,
}: OrganizationDetailDrawerOSProps) {
  const utils = trpc.useUtils();
  const [isConfirmingArchive, setIsConfirmingArchive] = useState(false);

  const { data, isLoading } = trpc.read.b2b.company.useQuery(
    { id: organizationId ?? 0 },
    { enabled: !!sessionToken && isOpen && organizationId != null }
  );

  const archiveOrganization = trpc.delete.b2b.company.useMutation({
    onSuccess: () => {
      utils.list.b2b.companies.invalidate();
      if (organizationId) utils.read.b2b.company.invalidate({ id: organizationId });
      setIsConfirmingArchive(false);
      onClose();
    },
  });

  const company = data?.company;
  const isReady = !isLoading && !!company;

  return (
    <>
      <SheetOS
        title="Organization detail"
        description={company?.name}
        isOpen={isOpen}
        onClose={onClose}
      >
        {!isReady ? (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 size={20} className="animate-spin text-gray-400 dark:text-zinc-500" />
          </div>
        ) : (
          <div className="flex flex-1 flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <OrganizationStatusLabel status={company.status} />
                <span className="text-xs text-gray-400">{company.industry_name}</span>
              </div>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-zinc-800">
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                  Primary contact
                </p>
                {company.pic_name ? (
                  <div className="mt-2 flex flex-col gap-1.5 text-sm text-gray-600 dark:text-zinc-300">
                    <span className="inline-flex items-center gap-1.5">
                      <User size={13} />
                      {company.pic_name}
                      {company.pic_job_title ? ` · ${company.pic_job_title}` : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={13} />
                      {company.pic_email ?? "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone size={13} />
                      {company.pic_wa ?? "—"}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-gray-400">No contact on file.</p>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
                  Timeline
                </p>
                <div className="mt-2">
                  <RecordTimelineOS entries={data.timeline} />
                </div>
              </div>
            </div>

            {company.status !== "ARCHIVED" && (
              <div className="sticky bottom-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
                <AppButton
                  type="button"
                  variant="outline"
                  className="w-full justify-center text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950/40"
                  onClick={() => setIsConfirmingArchive(true)}
                >
                  <Archive size={14} />
                  Archive organization
                </AppButton>
              </div>
            )}
          </div>
        )}
      </SheetOS>

      <AlertConfirmationOS
        isOpen={isConfirmingArchive}
        onClose={() => setIsConfirmingArchive(false)}
        onConfirm={() => organizationId && archiveOrganization.mutate({ id: organizationId })}
        title="Archive this organization?"
        message="Its leads and history stay intact, but it won't be selectable for new leads. This can be reversed by editing its status later."
        confirmLabel="Archive"
        destructive
        isPending={archiveOrganization.isPending}
      />
    </>
  );
}
