"use client";

import AppInput from "@/components/fields/AppInput";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import CreateLeadFormOS from "@/components/forms/CreateLeadFormOS";
import EditLeadFormOS from "@/components/forms/EditLeadFormOS";
import ProbabilityStatusLabel from "@/components/labels/ProbabilityStatusLabel";
import StageLabel from "@/components/labels/StageLabel";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { getRupiahCurrency, getShortRupiahCurrency } from "@/lib/currency";
import { setSessionToken, trpc } from "@/trpc/client";
import type { B2BStageEnum } from "@prisma/client";
import { Building2, Plus, Search, Wallet } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const scorecards = [
  { key: "pipeline_value" as const, label: "Pipeline Value" },
  { key: "weighted_value" as const, label: "Weighted Value" },
  { key: "closed_won_value" as const, label: "Closed Won" },
];

const stageOptions: AppSelectOption[] = [
  { value: "", label: "All Stages" },
  { value: "LEAD_IDENTIFIED", label: "Lead Identified" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "VERBAL_COMMIT", label: "Verbal Commit" },
  { value: "CLOSED_WON", label: "Closed Won" },
  { value: "CLOSED_LOST", label: "Closed Lost" },
  { value: "ON_HOLD", label: "On Hold" },
];

export default function LeadsPageOS({ sessionToken }: { sessionToken: string }) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPipelineId, setEditingPipelineId] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string | undefined>();
  const [stageFilter, setStageFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const pageSize = 21;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() === "" ? undefined : keyword.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  const { data, isLoading, isError } = trpc.list.b2b.pipelines.useQuery(
    {
      page,
      page_size: pageSize,
      keyword: debouncedKeyword,
      stage: (stageFilter || undefined) as B2BStageEnum | undefined,
      owner_id: ownerFilter || undefined,
    },
    { enabled: !!sessionToken }
  );

  const { data: userData } = trpc.list.users.useQuery(
    { page: 1, page_size: 200 },
    { enabled: !!sessionToken }
  );
  const ownerOptions: AppSelectOption[] = [
    { value: "", label: "All Owners" },
    ...(userData?.list.map((u) => ({
      value: u.id,
      label: u.full_name,
      image: u.avatar ?? undefined,
    })) ?? []),
  ];

  const pipelineList = data?.list;
  const totalPage = data?.metapaging.total_page ?? 1;

  return (
    <div className="px-4 py-6 flex flex-col gap-5 sm:px-8">
      <PageHeaderOS
        title="Leads"
        description="Track and manage every lead across the B2B sales pipeline"
        action={{
          label: "Add Lead",
          icon: Plus,
          onClick: () => setIsCreateOpen(true),
        }}
      />

      {/* Scorecards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {scorecards.map((sc) => (
          <div
            key={sc.key}
            className="bg-card-bg rounded-xl border border-dashboard-border p-5 flex flex-col gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-claude/10 flex items-center justify-center">
              <Wallet size={16} className="text-claude" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                {getShortRupiahCurrency(data?.scorecards[sc.key] ?? 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{sc.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <AppInput
          inputId="leads-search"
          icon={<Search size={14} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search company, PIC, or email..."
          className="max-w-full sm:max-w-sm"
        />
        <div className="w-full max-w-52">
          <AppSelect
            selectId="leads-stage-filter"
            placeholder="All Stages"
            value={stageFilter}
            options={stageOptions}
            onChange={(value) => {
              setStageFilter((value as string) ?? "");
              setPage(1);
            }}
          />
        </div>
        <div className="w-full max-w-56">
          <AppSelect
            selectId="leads-owner-filter"
            placeholder="All Owners"
            value={ownerFilter}
            options={ownerOptions}
            onChange={(value) => {
              setOwnerFilter((value as string) ?? "");
              setPage(1);
            }}
          />
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-400 dark:text-zinc-500 py-8 text-center">Loading leads...</p>}
      {isError && (
        <p className="text-sm text-red-500 py-8 text-center">
          Failed to load leads. You may not have access to this data.
        </p>
      )}

      {pipelineList && !isLoading && !isError && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pipelineList.map((post) => (
            <div
              key={post.id}
              role="button"
              tabIndex={0}
              onClick={() => setEditingPipelineId(post.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setEditingPipelineId(post.id);
                }
              }}
              className="flex cursor-pointer flex-col gap-3 rounded-xl border border-gray-300 bg-card-bg p-5 text-left transition-colors hover:border-claude/60 dark:border-zinc-700"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800">
                  {post.company_image_url ? (
                    <Image
                      src={post.company_image_url}
                      alt={post.company_name}
                      width={44}
                      height={44}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Building2 size={18} className="text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bold text-gray-900 dark:text-zinc-100">
                    {post.company_name}
                  </h3>
                  <p className="truncate text-xs text-gray-500 dark:text-zinc-400">
                    {post.industry_name}
                  </p>
                </div>
              </div>

              <p className="truncate text-sm text-gray-600 dark:text-zinc-300">
                {post.name}
              </p>

              <div className="flex flex-wrap items-center gap-1.5">
                <StageLabel stage={post.stage} />
                <ProbabilityStatusLabel status={post.probability_status} />
              </div>

              <div className="mt-1 flex items-center justify-between gap-2 border-t border-gray-100 pt-3 dark:border-zinc-800">
                <span className="font-semibold text-gray-900 dark:text-zinc-100">
                  {getRupiahCurrency(Number(post.project_value))}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-700 shrink-0">
                    {post.owner_avatar && (
                      <Image
                        src={post.owner_avatar}
                        alt={post.owner_name}
                        width={20}
                        height={20}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <span className="truncate text-xs text-gray-700 dark:text-zinc-300">
                    {post.owner_name}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {pipelineList.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-10 sm:col-span-2 xl:col-span-3">
              {debouncedKeyword
                ? `No leads found for "${debouncedKeyword}"`
                : "No leads yet."}
            </p>
          )}
        </div>
      )}

      <AppPaginationOS
        currentPage={page}
        totalPages={totalPage}
        onPageChange={setPage}
      />

      <CreateLeadFormOS
        sessionToken={sessionToken}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <EditLeadFormOS
        sessionToken={sessionToken}
        pipelineId={editingPipelineId}
        isOpen={editingPipelineId !== null}
        onClose={() => setEditingPipelineId(null)}
      />
    </div>
  );
}
