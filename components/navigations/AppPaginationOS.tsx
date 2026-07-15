"use client";

import AppButton from "@/components/buttons/AppButton";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AppPaginationOSProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageEntry = number | "ellipsis-start" | "ellipsis-end";

// Always shows first/last page, the current page's immediate neighbors, and
// collapses the rest behind an ellipsis.
function getPageNumbers(currentPage: number, totalPages: number): PageEntry[] {
  const pages: PageEntry[] = [1];
  const maxVisiblePages = 5;

  let startPage = Math.max(2, currentPage - 1);
  let endPage = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 3) {
    endPage = Math.min(maxVisiblePages, totalPages - 1);
  }
  if (currentPage >= totalPages - 2) {
    startPage = Math.max(2, totalPages - maxVisiblePages + 1);
  }

  if (startPage > 2) pages.push("ellipsis-start");
  for (let i = startPage; i <= endPage; i++) pages.push(i);
  if (endPage < totalPages - 1) pages.push("ellipsis-end");
  if (totalPages > 1) pages.push(totalPages);

  return pages;
}

export default function AppPaginationOS({
  currentPage,
  totalPages,
  onPageChange,
}: AppPaginationOSProps) {
  if (totalPages <= 1) return null;

  function goTo(page: number) {
    if (page === currentPage || page < 1 || page > totalPages) return;
    onPageChange(page);
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5"
    >
      <AppButton
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => goTo(currentPage - 1)}
        aria-label="Go to previous page"
      >
        <ChevronLeft size={14} />
        <span className="hidden sm:inline">Previous</span>
      </AppButton>

      {getPageNumbers(currentPage, totalPages).map((page, index) =>
        page === "ellipsis-start" || page === "ellipsis-end" ? (
          <span
            key={`${page}-${index}`}
            aria-hidden="true"
            className="flex size-8 items-center justify-center text-sm text-gray-400 dark:text-zinc-500"
          >
            …
          </span>
        ) : (
          <AppButton
            key={page}
            variant={currentPage === page ? "outline" : "ghost"}
            size="iconSm"
            aria-current={currentPage === page ? "page" : undefined}
            onClick={() => goTo(page)}
          >
            {page}
          </AppButton>
        )
      )}

      <AppButton
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => goTo(currentPage + 1)}
        aria-label="Go to next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={14} />
      </AppButton>
    </nav>
  );
}
