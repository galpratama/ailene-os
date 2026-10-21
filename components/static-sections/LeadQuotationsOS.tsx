"use client";

import AppButton from "@/components/buttons/AppButton";
import QuotationStatusLabel from "@/components/labels/QuotationStatusLabel";
import { useQuotationList } from "@/hooks/useQuotationList";
import { getRupiahCurrency } from "@/lib/currency";
import { pricingUrlForPipeline } from "@/lib/quotation-navigation";
import { formatQuotationNumber } from "@/lib/quotation-number";
import { Loader2, Plus } from "lucide-react";
import type { MouseEvent } from "react";

export default function LeadQuotationsOS({
  pipelineId,
  sessionToken,
  disabled = false,
}: {
  pipelineId: number;
  sessionToken: string;
  disabled?: boolean;
}) {
  const quotations = useQuotationList(
    { pipeline_id: pipelineId },
    !!sessionToken
  );

  function handleNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (disabled) event.preventDefault();
  }

  return (
    <section className="shrink-0 overflow-hidden rounded-xl border border-line">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200">
          Quotations
        </h3>
        <AppButton
          href={pricingUrlForPipeline(pipelineId)}
          variant="outline"
          size="sm"
          aria-disabled={disabled || undefined}
          tabIndex={disabled ? -1 : undefined}
          onClick={handleNavigation}
          className={disabled ? "pointer-events-none opacity-50" : undefined}
        >
          <Plus size={14} />
          Add Quotation
        </AppButton>
      </div>

      {quotations.isLoading ? (
        <p
          role="status"
          className="flex items-center gap-2 px-4 py-4 text-xs text-gray-400"
        >
          <Loader2 size={14} className="animate-spin" /> Loading quotations...
        </p>
      ) : quotations.isError ? (
        <div className="flex flex-col items-start gap-2 px-4 py-4">
          <p className="text-xs text-merah">{quotations.error.message}</p>
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void quotations.refetch()}
          >
            Try again
          </AppButton>
        </div>
      ) : quotations.data?.length ? (
        <ul className="divide-y divide-line-soft">
          {quotations.data.map((quotation) => (
            <li key={quotation.id}>
              <AppButton
                href={`/quotations/${quotation.id}`}
                variant="row"
                size="row"
                aria-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : undefined}
                onClick={handleNavigation}
                className={`min-w-0 justify-between ${disabled ? "pointer-events-none opacity-50" : ""}`}
              >
                <span className="flex min-w-0 flex-col items-start gap-1.5">
                  <span className="break-all text-xs font-semibold text-gray-800 dark:text-zinc-200">
                    {formatQuotationNumber(quotation)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400">
                    {getRupiahCurrency(Number(quotation.net_value))}
                  </span>
                </span>
                <span className="shrink-0">
                  <QuotationStatusLabel status={quotation.status} />
                </span>
              </AppButton>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-4 text-xs text-gray-400 dark:text-zinc-500">
          No linked quotations yet.
        </p>
      )}
    </section>
  );
}
