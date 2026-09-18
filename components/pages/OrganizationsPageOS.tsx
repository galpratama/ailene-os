"use client";

import type { CompanySource } from "@/apis/sales";
import AppInput from "@/components/fields/AppInput";
import AppSelect, { type AppSelectOption } from "@/components/fields/AppSelect";
import OrganizationDetailDrawerOS from "@/components/modals/OrganizationDetailDrawerOS";
import AppPaginationOS from "@/components/navigations/AppPaginationOS";
import PageHeaderOS from "@/components/navigations/PageHeaderOS";
import { requireApiData } from "@/lib/api-result";
import { listCompanies } from "@/lib/actions";
import { trpc } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Building2, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const sourceOptions: AppSelectOption[] = [
  { value: "", label: "All sources" },
  { value: "referral", label: "Referral" },
  { value: "outreach", label: "Outreach" },
  { value: "inbound", label: "Inbound" },
];

export default function OrganizationsPageOS({ sessionToken }: { sessionToken: string }) {
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>();
  const [sourceFilter, setSourceFilter] = useState("");
  const [openOrganizationId, setOpenOrganizationId] = useState<number | null>(null);
  const pageSize = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() || undefined);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [keyword]);

  const companiesQuery = useQuery({
    queryKey: ["sales", "companies", { page, keyword: debouncedKeyword, sourceFilter }],
    queryFn: async () =>
      requireApiData(
        await listCompanies({
          page,
          page_size: pageSize,
          keyword: debouncedKeyword,
          source: (sourceFilter || undefined) as CompanySource | undefined,
        })
      ),
    enabled: !!sessionToken,
  });
  const { data: industryData } = trpc.list.industries.useQuery(undefined, {
    enabled: !!sessionToken,
  });
  const industries = useMemo(
    () => new Map(industryData?.list.map((industry) => [industry.id, industry.name]) ?? []),
    [industryData]
  );
  const organizationList = companiesQuery.data?.list;
  const totalPage = companiesQuery.data?.metapaging.total_page ?? 1;

  return (
    <div className="px-4 py-6 flex flex-col gap-5 sm:px-8">
      <PageHeaderOS title="Organizations" description="Company master data served by the Java sales API." />
      <div className="flex flex-wrap items-center gap-3">
        <AppInput inputId="organizations-search" icon={<Search size={14} />} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search companies..." className="max-w-full sm:max-w-sm" />
        <div className="w-full max-w-48">
          <AppSelect selectId="organizations-source-filter" placeholder="Filter by source" value={sourceFilter} options={sourceOptions} onChange={(value) => {
            setSourceFilter((value as string) ?? "");
            setPage(1);
          }} />
        </div>
      </div>

      {companiesQuery.isLoading && <p className="py-8 text-center text-sm text-gray-400">Loading organizations...</p>}
      {companiesQuery.isError && <p className="py-8 text-center text-sm text-red-500">{companiesQuery.error.message}</p>}

      {organizationList && (
        <div className="overflow-hidden rounded-xl border border-gray-300 bg-card-bg dark:border-zinc-700">
          <div className="overflow-x-auto">
            <table className="w-full min-w-190 text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 dark:border-zinc-800">
                  <th className="px-5 py-3">Name</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Industry</th><th className="px-5 py-3">Legal ID</th><th className="px-5 py-3">Website</th>
                </tr>
              </thead>
              <tbody>
                {organizationList.map((company) => (
                  <tr key={company.id} onClick={() => setOpenOrganizationId(company.id)} className="cursor-pointer border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50">
                    <td className="px-5 py-3.5"><div className="flex items-center gap-2.5"><div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-800"><Building2 size={14} className="text-gray-400" /></div><p className="truncate font-semibold text-gray-900 dark:text-zinc-100">{company.name}</p></div></td>
                    <td className="px-5 py-3.5 capitalize text-gray-600 dark:text-zinc-300">{company.source}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">{company.industry_id ? industries.get(company.industry_id) ?? `#${company.industry_id}` : "—"}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">{company.legal_identifier ?? "—"}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-zinc-300">{company.website_url ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {organizationList.length === 0 && <p className="py-10 text-center text-sm text-gray-400">No organizations found.</p>}
          </div>
        </div>
      )}
      <AppPaginationOS currentPage={page} totalPages={totalPage} onPageChange={setPage} />
      <OrganizationDetailDrawerOS sessionToken={sessionToken} organizationId={openOrganizationId} isOpen={openOrganizationId !== null} onClose={() => setOpenOrganizationId(null)} />
    </div>
  );
}
