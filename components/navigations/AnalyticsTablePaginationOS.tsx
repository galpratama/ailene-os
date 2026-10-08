"use client";

import AppPaginationOS from "@/components/navigations/AppPaginationOS";

export const ANALYTICS_TABLE_PAGE_SIZE = 10;

export default function AnalyticsTablePaginationOS({
  page,
  total,
  onPageChange,
}: {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total === 0) return null;
  const first = (page - 1) * ANALYTICS_TABLE_PAGE_SIZE + 1;
  const last = Math.min(page * ANALYTICS_TABLE_PAGE_SIZE, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-5 py-3">
      <p className="text-xs tabular-nums text-gray-500 dark:text-zinc-400">
        Showing {first}–{last} of {total}
      </p>
      <AppPaginationOS
        currentPage={page}
        totalPages={Math.ceil(total / ANALYTICS_TABLE_PAGE_SIZE)}
        onPageChange={onPageChange}
      />
    </div>
  );
}
