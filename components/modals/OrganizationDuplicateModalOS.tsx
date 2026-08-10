"use client";

import AppButton from "@/components/buttons/AppButton";
import { AlertTriangle, Briefcase, Loader2, Link2, User, X } from "lucide-react";
import { useEffect } from "react";

export interface OrganizationDuplicateCandidate {
  id: number;
  name: string;
  status: string;
  matched_reasons: string[];
  owner_name: string | null;
  owner_avatar: string | null;
  active_pipeline_count: number;
}

interface OrganizationDuplicateModalOSProps {
  isOpen: boolean;
  onClose: () => void;
  proposedName: string;
  matches: OrganizationDuplicateCandidate[];
  onLinkExisting: (organizationId: number) => void;
  onCreateAnyway: () => void;
  onRequestReview: () => void;
  isLinking?: boolean;
  isCreating?: boolean;
  isRequestingReview?: boolean;
}

export default function OrganizationDuplicateModalOS({
  isOpen,
  onClose,
  proposedName,
  matches,
  onLinkExisting,
  onCreateAnyway,
  onRequestReview,
  isLinking = false,
  isCreating = false,
  isRequestingReview = false,
}: OrganizationDuplicateModalOSProps) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const anyPending = isLinking || isCreating || isRequestingReview;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-300 bg-card-bg shadow-xl dark:border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-kuning-t text-kuning">
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                Possible duplicate organization
              </h2>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-zinc-400">
                &quot;{proposedName}&quot; looks similar to what&apos;s already in your CRM.
              </p>
            </div>
          </div>
          <AppButton
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </AppButton>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4 max-h-80 overflow-y-auto">
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex flex-col gap-2 rounded-xl border border-gray-200 p-4 dark:border-zinc-800"
            >
              <p className="font-semibold text-gray-900 dark:text-zinc-100">
                {match.name}
              </p>
              <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-zinc-400">
                <span className="inline-flex items-center gap-1.5">
                  <User size={13} />
                  Current owner: {match.owner_name ?? "Unassigned"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Briefcase size={13} />
                  Active opportunities: {match.active_pipeline_count}
                </span>
              </div>
              <AppButton
                type="button"
                variant="primary"
                size="sm"
                className="mt-1 justify-center"
                disabled={anyPending}
                onClick={() => onLinkExisting(match.id)}
              >
                {isLinking && <Loader2 size={14} className="animate-spin" />}
                <Link2 size={14} />
                Link existing
              </AppButton>
            </div>
          ))}

          <p className="text-sm text-gray-500 dark:text-zinc-400">
            What would you like to do?
          </p>
        </div>

        <div className="flex items-center gap-2 border-t border-gray-200 px-5 py-4 dark:border-zinc-800">
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 justify-center"
            disabled={anyPending}
            onClick={onCreateAnyway}
          >
            {isCreating && <Loader2 size={14} className="animate-spin" />}
            Create anyway
          </AppButton>
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 justify-center"
            disabled={anyPending}
            onClick={onRequestReview}
          >
            {isRequestingReview && <Loader2 size={14} className="animate-spin" />}
            Request review
          </AppButton>
        </div>
      </div>
    </div>
  );
}
