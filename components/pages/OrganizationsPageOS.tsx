"use client";

import AppButton from "@/components/buttons/AppButton";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { AppSelectOption } from "@/components/fields/AppSelect";
import OrganizationStatusLabel from "@/components/labels/OrganizationStatusLabel";
import OrganizationDetailDrawerOS from "@/components/modals/OrganizationDetailDrawerOS";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { setSessionToken, trpc } from "@/trpc/client";
import { OrganizationStatusEnum } from "@prisma/client";
import { Building2, Check, Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const statusOptions: AppSelectOption[] = [
  { value: "", label: "All statuses" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "CUSTOMER", label: "Customer" },
  { value: "ARCHIVED", label: "Archived" },
];

export default function OrganizationsPageOS({
  sessionToken,
}: {
  sessionToken: string;
}) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const { data: sessionData } = trpc.auth.checkSession.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const canReviewDuplicates = ["Administrator", "Super Admin", "Manager"].includes(
    sessionData?.user.role_name ?? ""
  );

  const [tab, setTab] = useState<"organizations" | "reviews">("organizations");

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState("");
  const [openOrganizationId, setOpenOrganizationId] = useState<number | null>(null);
  const pageSize = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() === "" ? undefined : keyword.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  const { data, isLoading, isError } = trpc.list.b2b.companies.useQuery(
    {
      page,
      page_size: pageSize,
      keyword: debouncedKeyword,
      status: (statusFilter || undefined) as OrganizationStatusEnum | undefined,
      include_archived: true,
    },
    { enabled: !!sessionToken && tab === "organizations" }
  );

  const organizationList = data?.list;
  const totalPage = data?.metapaging.total_page ?? 1;

  return (
    <div className="px-4 py-6 flex flex-col gap-5 sm:px-8">
      <PageHeaderOS
        title="Organizations"
        description="Master data for every company in the CRM, with duplicate protection."
      />

      <div className="flex gap-1 border-b border-gray-200 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => setTab("organizations")}
          className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
            tab === "organizations"
              ? "border-lime-bright text-forest-deep dark:text-lime-bright"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"
          }`}
        >
          Organizations
        </button>
        {canReviewDuplicates && (
          <button
            type="button"
            onClick={() => setTab("reviews")}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "reviews"
                ? "border-lime-bright text-forest-deep dark:text-lime-bright"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"
            }`}
          >
            Duplicate reviews
          </button>
        )}
      </div>

      {tab === "organizations" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <AppInput
              inputId="organizations-search"
              icon={<Search size={14} />}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search organizations, PIC..."
              className="max-w-full sm:max-w-sm"
            />
            <div className="w-full max-w-48">
              <AppSelect
                selectId="organizations-status-filter"
                placeholder="Filter by status"
                value={statusFilter}
                options={statusOptions}
                onChange={(value) => {
                  setStatusFilter((value as string) ?? "");
                  setPage(1);
                }}
              />
            </div>
          </div>

          {isLoading && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 py-8 text-center">
              Loading organizations...
            </p>
          )}
          {isError && (
            <p className="text-sm text-red-500 py-8 text-center">
              Failed to load organizations.
            </p>
          )}

          {organizationList && !isLoading && !isError && (
            <div className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
              <div className="overflow-x-auto">
                <table className="w-full min-w-190 text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                      <th className="px-5 py-3">Name</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Industry</th>
                      <th className="px-5 py-3">PIC</th>
                      <th className="px-5 py-3">No. HP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizationList.map((entry) => (
                      <tr
                        key={entry.id}
                        onClick={() => setOpenOrganizationId(entry.id)}
                        className="cursor-pointer border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800">
                              <Building2 size={14} className="text-gray-400" />
                            </div>
                            <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">
                              {entry.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <OrganizationStatusLabel status={entry.status} />
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                          {entry.industry_name}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                          {entry.pic_name ?? "—"}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">
                          {entry.pic_wa ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {organizationList.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-10">
                    {debouncedKeyword
                      ? `No organizations found for "${debouncedKeyword}"`
                      : "No organizations yet."}
                  </p>
                )}
              </div>
            </div>
          )}

          <AppPaginationOS
            currentPage={page}
            totalPages={totalPage}
            onPageChange={setPage}
          />
        </>
      )}

      {tab === "reviews" && <DuplicateReviewsTab />}

      <OrganizationDetailDrawerOS
        sessionToken={sessionToken}
        organizationId={openOrganizationId}
        isOpen={openOrganizationId !== null}
        onClose={() => setOpenOrganizationId(null)}
      />
    </div>
  );
}

function MatchedOrganizationName({ organizationId }: { organizationId: number }) {
  const { data } = trpc.read.b2b.company.useQuery({ id: organizationId });
  return <>{data?.company.name ?? "…"}</>;
}

function DuplicateReviewsTab() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.list.b2b.organizationDuplicateReviews.useQuery({
    page: 1,
    page_size: 50,
  });

  const resolve = trpc.update.b2b.resolveOrganizationDuplicateReview.useMutation({
    onSuccess: () => utils.list.b2b.organizationDuplicateReviews.invalidate(),
  });

  const reviews = data?.list ?? [];

  if (isLoading) {
    return (
      <p className="text-sm text-gray-400 dark:text-zinc-500 py-8 text-center">
        Loading duplicate reviews...
      </p>
    );
  }

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-zinc-500 py-10 text-center">
        No pending duplicate reviews.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => {
        const singleMatchId =
          review.matched_organization_ids.length === 1
            ? review.matched_organization_ids[0]
            : null;
        const isPending = resolve.isPending;

        return (
          <div
            key={review.id}
            className="flex flex-col gap-3 rounded-xl border border-gray-300 bg-card-bg p-4 dark:border-zinc-700"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-zinc-100">
                  {review.proposed_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Requested by {review.requested_by_name} ·{" "}
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
                {review.proposed_pic_name && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                    PIC: {review.proposed_pic_name}
                    {review.proposed_pic_email ? ` · ${review.proposed_pic_email}` : ""}
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {review.matched_organization_ids.length} possible match
                {review.matched_organization_ids.length === 1 ? "" : "es"}
                {singleMatchId && (
                  <>
                    : <MatchedOrganizationName organizationId={singleMatchId} />
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {singleMatchId && (
                <AppButton
                  type="button"
                  variant="primary"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    resolve.mutate({
                      id: review.id,
                      resolution: "LINKED_EXISTING",
                      resolved_organization_id: singleMatchId,
                    })
                  }
                >
                  <Check size={13} />
                  Link to existing
                </AppButton>
              )}
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() =>
                  resolve.mutate({ id: review.id, resolution: "CREATED_NEW" })
                }
              >
                Create as new
              </AppButton>
              <AppButton
                type="button"
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={() =>
                  resolve.mutate({ id: review.id, resolution: "DISMISSED" })
                }
              >
                {isPending ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                Dismiss
              </AppButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}
