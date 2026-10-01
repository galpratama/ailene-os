"use client";

import AppButton from "@/components/buttons/AppButton";
import CreateSignalFormOS from "@/components/forms/CreateSignalFormOS";
import EditSignalFormOS from "@/components/forms/EditSignalFormOS";
import AppInput from "@/components/fields/AppInput";
import AppSelect from "@/components/fields/AppSelect";
import Label from "@/components/labels/Label";
import SignalStatusLabel from "@/components/labels/SignalStatusLabel";
import SignalTypeLabel from "@/components/labels/SignalTypeLabel";
import AlertConfirmationOS from "@/components/modals/AlertConfirmationOS";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import type { SignalData, SignalSource, SignalStatus, SignalType } from "@/apis/signals";
import { deleteSignal, listSignals } from "@/lib/actions";
import { requireApiData, requireApiSuccess } from "@/lib/api-result";
import { SIGNAL_SOURCE_LABELS, SIGNAL_SOURCE_OPTIONS, SIGNAL_STATUS_OPTIONS, SIGNAL_TYPE_OPTIONS } from "@/lib/signals";
import { showErrorToast } from "@/lib/toast";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 20;

const typeFilterOptions = [{ value: "", label: "All types" }, ...SIGNAL_TYPE_OPTIONS];
const statusFilterOptions = [{ value: "", label: "All statuses" }, ...SIGNAL_STATUS_OPTIONS];
const sourceFilterOptions = [{ value: "", label: "All sources" }, ...SIGNAL_SOURCE_OPTIONS];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function IntentScore({ score }: { score: number | null }) {
  if (score === null) return <span className="text-gray-400">-</span>;
  const variant = score >= 7 ? "merah" : score >= 4 ? "oranye" : "gray";
  return <Label variant={variant}>{score}/10</Label>;
}

function SignalTitle({ row }: { row: SignalData }) {
  const heading =
    row.type === "decision_maker"
      ? [row.subject_name, row.subject_job_title].filter(Boolean).join(" - ")
      : row.company_name || row.source_title || row.source_url;
  const detail =
    row.type === "decision_maker" ? row.company_name : row.signal_reason || row.source_title;

  return (
    <div className="flex max-w-96 flex-col gap-0.5">
      <a
        href={row.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-semibold text-gray-900 hover:text-claude dark:text-zinc-100"
      >
        <span className="truncate">{heading}</span>
        <ExternalLink size={12} className="shrink-0" />
      </a>
      {detail && <span className="truncate text-xs text-gray-500 dark:text-zinc-400">{detail}</span>}
    </div>
  );
}

export default function SignalsPageOS({ sessionToken }: { sessionToken: string }) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState<SignalType | "">("");
  const [status, setStatus] = useState<SignalStatus | "">("");
  const [source, setSource] = useState<SignalSource | "">("");
  const [page, setPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editing, setEditing] = useState<SignalData | null>(null);
  const [deleting, setDeleting] = useState<SignalData | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setKeyword(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const filters = {
    keyword: keyword || undefined,
    type: type || undefined,
    status: status || undefined,
    source: source || undefined,
    page,
    page_size: PAGE_SIZE,
  };

  const query = useQuery({
    queryKey: ["signals", filters],
    queryFn: async () => requireApiData(await listSignals(filters)),
    enabled: !!sessionToken,
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => requireApiSuccess(await deleteSignal(id)),
    onSuccess: async () => {
      toast.success("Signal deleted.");
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
    onError: (error) => showErrorToast(error, "Failed to delete signal."),
  });

  const rows = query.data?.list ?? [];
  const metapaging = query.data?.metapaging;
  const hasFilters = !!(keyword || type || status || source);

  function changeFilter(apply: () => void) {
    apply();
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6 sm:px-8">
      <PageHeaderOS
        title="Signals"
        description="Unqualified sales-research findings: hot leads, warm accounts, and decision makers to review."
        action={{ label: "Add signal", icon: Plus, onClick: () => setIsCreating(true) }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <AppInput
          inputId="signals-search"
          icon={<Search size={14} />}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search signals..."
          className="max-w-full sm:max-w-xs"
        />
        <div className="w-full max-w-44">
          <AppSelect
            selectId="signals-type-filter"
            placeholder="All types"
            value={type}
            options={typeFilterOptions}
            onChange={(value) => changeFilter(() => setType((value as SignalType | "") ?? ""))}
          />
        </div>
        <div className="w-full max-w-44">
          <AppSelect
            selectId="signals-status-filter"
            placeholder="All statuses"
            value={status}
            options={statusFilterOptions}
            onChange={(value) => changeFilter(() => setStatus((value as SignalStatus | "") ?? ""))}
          />
        </div>
        <div className="w-full max-w-44">
          <AppSelect
            selectId="signals-source-filter"
            placeholder="All sources"
            value={source}
            options={sourceFilterOptions}
            onChange={(value) => changeFilter(() => setSource((value as SignalSource | "") ?? ""))}
          />
        </div>
      </div>

      {metapaging && metapaging.total_data > 0 && (
        <p className="text-sm text-gray-500 dark:text-zinc-400">{metapaging.total_data} signals</p>
      )}

      <div
        className={`overflow-hidden rounded-xl border border-line bg-card-bg ${query.isFetching && !query.isLoading ? "opacity-60" : ""}`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-240 text-sm">
            <thead>
              <tr className="border-b border-line-soft text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Signal</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Intent</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Found</th>
                <th className="px-5 py-3">Status</th>
                <th className="w-24 px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-line-soft last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                >
                  <td className="px-5 py-3">
                    <SignalTitle row={row} />
                  </td>
                  <td className="px-5 py-3">
                    <SignalTypeLabel type={row.type} />
                  </td>
                  <td className="px-5 py-3">
                    <IntentScore score={row.intent_score} />
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-zinc-300">
                    {SIGNAL_SOURCE_LABELS[row.source] ?? row.source}
                    {row.indonesia_signal && <span className="ml-1.5 text-xs text-gray-400">ID</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-600 dark:text-zinc-300">{formatDate(row.created_at)}</td>
                  <td className="px-5 py-3">
                    <SignalStatusLabel status={row.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <AppButton variant="ghost" size="icon" title="Edit signal" onClick={() => setEditing(row)}>
                        <Pencil size={14} />
                      </AppButton>
                      <AppButton variant="ghost" size="icon" title="Delete signal" onClick={() => setDeleting(row)}>
                        <Trash2 size={14} />
                      </AppButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {query.isLoading && (
            <p className="py-10 text-center text-sm text-gray-400 dark:text-zinc-500">Loading signals...</p>
          )}
          {query.isError && <p className="py-10 text-center text-sm text-merah">{query.error.message}</p>}
          {query.isSuccess && rows.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400 dark:text-zinc-500">
              {hasFilters ? "No signals match these filters." : "No signals yet."}
            </p>
          )}
        </div>
      </div>

      <AppPaginationOS currentPage={page} totalPages={metapaging?.total_page ?? 1} onPageChange={setPage} />

      {isCreating && <CreateSignalFormOS onClose={() => setIsCreating(false)} />}
      {editing && <EditSignalFormOS key={editing.id} signal={editing} onClose={() => setEditing(null)} />}

      <AlertConfirmationOS
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && deleteMutation.mutate(deleting.id)}
        title="Delete signal?"
        message="This permanently removes the signal and its source link."
        confirmLabel="Delete"
        destructive
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
