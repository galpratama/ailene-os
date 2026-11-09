import AppButton from "@/components/buttons/AppButton";
import RevenuePendingOS, { type PendingShape } from "@/components/elements/RevenuePendingOS";
import PendingLabelOS from "@/components/labels/PendingLabelOS";
import { TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

// One frame for every revenue widget: title, how to read it, the content, and where the numbers came from.
export default function RevenueCardOS({
  title,
  description,
  source,
  pending,
  pendingShape,
  pendingColumns,
  partialNote,
  isLoading,
  isEmpty,
  emptyMessage = "No data in this period.",
  error,
  onRetry,
  actions,
  className,
  children,
}: {
  title: string;
  description?: string;
  source?: string;
  pending?: string;
  pendingShape?: PendingShape;
  pendingColumns?: string[];
  partialNote?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  error?: unknown;
  onRetry?: () => void;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section aria-label={title} className={`flex min-w-0 flex-col rounded-xl border border-line bg-card-bg ${className ?? ""}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 px-5 pt-4">
        <div className="min-w-0 flex-1 basis-56">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{title}</h3>
            {pending && <PendingLabelOS />}
          </div>
          {description && <p className="mt-0.5 text-xs leading-relaxed text-gray-500 dark:text-zinc-400">{description}</p>}
        </div>
        {actions}
      </header>
      <div className="min-w-0 flex-1 px-5 py-4">
        {pending ? (
          <RevenuePendingOS shape={pendingShape} reason={pending} columns={pendingColumns} />
        ) : error && !isLoading ? (
          <div role="alert" className="flex min-h-32 flex-col items-center justify-center gap-2 text-center">
            <TriangleAlert size={18} className="text-merah" aria-hidden="true" />
            <p className="max-w-sm text-sm text-gray-600 dark:text-zinc-300">{error instanceof Error ? error.message : "These figures could not be loaded."}</p>
            {onRetry && (
              <AppButton type="button" variant="outline" size="sm" onClick={onRetry}>
                Try again
              </AppButton>
            )}
          </div>
        ) : isLoading ? (
          <div aria-busy="true" aria-label={`Loading ${title}`} className="h-40 animate-pulse rounded-lg bg-line-soft/60 motion-reduce:animate-none" />
        ) : isEmpty ? (
          <p className="flex min-h-32 items-center justify-center text-center text-sm text-gray-500 dark:text-zinc-400">{emptyMessage}</p>
        ) : (
          children
        )}
        {partialNote && !pending && (
          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-zinc-400">
            <PendingLabelOS />
            {partialNote}
          </p>
        )}
      </div>
      {source && <footer className="border-t border-line-soft px-5 py-2 text-xs text-gray-500 dark:text-zinc-400">{source}</footer>}
    </section>
  );
}
