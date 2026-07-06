"use client";

import AppInput from "@/components/fields/AppInput";
import CreateLeadFormOS from "@/components/forms/CreateLeadFormOS";
import StageLabel from "@/components/labels/StageLabel";
import { useHeaderAction } from "@/contexts/HeaderActionContext";
import { getRupiahCurrency, getShortRupiahCurrency } from "@/lib/currency";
import { setSessionToken, trpc } from "@/trpc/client";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SquareArrowOutUpRight,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const scorecards = [
  { key: "pipeline_value" as const, label: "Pipeline Value" },
  { key: "weighted_value" as const, label: "Weighted Value" },
  { key: "closed_won_value" as const, label: "Closed Won" },
];

export default function LeadsPageOS({ sessionToken }: { sessionToken: string }) {
  useEffect(() => {
    if (sessionToken) setSessionToken(sessionToken);
  }, [sessionToken]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  useHeaderAction({
    label: "Add Lead",
    icon: Plus,
    onClick: () => setIsCreateOpen(true),
  });

  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState<string | undefined>();
  const pageSize = 20;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim() === "" ? undefined : keyword.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  const { data, isLoading, isError } = trpc.list.b2b.pipelines.useQuery(
    { page, page_size: pageSize, keyword: debouncedKeyword },
    { enabled: !!sessionToken }
  );

  const pipelineList = data?.list;
  const totalPage = data?.metapaging.total_page ?? 1;

  return (
    <div className="px-8 py-6 flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Leads · B2B</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Track and manage every lead across the B2B sales pipeline
        </p>
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-3 gap-4">
        {scorecards.map((sc) => (
          <div
            key={sc.key}
            className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-claude/10 flex items-center justify-center">
              <Wallet size={16} className="text-claude" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {getShortRupiahCurrency(data?.scorecards[sc.key] ?? 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{sc.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <AppInput
          inputId="leads-search"
          icon={<Search size={14} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search company, PIC, or email..."
        />
      </div>

      {isLoading && <p className="text-sm text-gray-400 py-8 text-center">Loading leads...</p>}
      {isError && (
        <p className="text-sm text-red-500 py-8 text-center">
          Failed to load leads. You may not have access to this data.
        </p>
      )}

      {pipelineList && !isLoading && !isError && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <th className="px-5 py-3">Company</th>
                <th className="px-5 py-3">Industry</th>
                <th className="px-5 py-3">Program</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Value</th>
                <th className="px-5 py-3">Owner</th>
              </tr>
            </thead>
            <tbody>
              {pipelineList.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/leads/${post.id}`}
                      className="flex items-center gap-1.5 font-semibold text-gray-900 hover:text-claude"
                    >
                      {post.company_name}
                      <SquareArrowOutUpRight size={12} />
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{post.industry_name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{post.name}</td>
                  <td className="px-5 py-3.5">
                    <StageLabel stage={post.stage} />
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                    {getRupiahCurrency(Number(post.project_value))}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 shrink-0">
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
                      <span className="text-gray-700">{post.owner_name}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {pipelineList.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">
              {debouncedKeyword
                ? `No leads found for "${debouncedKeyword}"`
                : "No leads yet."}
            </p>
          )}
        </div>
      )}

      {data && totalPage > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="p-1.5 rounded-lg border border-gray-300 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-gray-500">
            Page {page} of {totalPage}
          </span>
          <button
            disabled={page >= totalPage}
            onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
            className="p-1.5 rounded-lg border border-gray-300 text-gray-500 disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <CreateLeadFormOS
        sessionToken={sessionToken}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
}
