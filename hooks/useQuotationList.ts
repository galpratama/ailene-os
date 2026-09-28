"use client";

import type { ListQuotationsOptions, QuotationListItem } from "@/apis/quotations";
import { requireApiData } from "@/lib/api-result";
import { listQuotations } from "@/lib/actions";
import { useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 100;

// The Quotations table shows every match, but the API caps a page at 100 — so walk all pages.
export function useQuotationList(
  filters: Omit<ListQuotationsOptions, "page" | "page_size">,
  enabled: boolean
) {
  return useQuery<QuotationListItem[]>({
    queryKey: ["quotations", "list", filters],
    queryFn: async () => {
      const first = requireApiData(
        await listQuotations({ ...filters, page: 1, page_size: PAGE_SIZE })
      );
      const rest = await Promise.all(
        Array.from({ length: Math.max(first.metapaging.total_page - 1, 0) }, (_, i) =>
          listQuotations({ ...filters, page: i + 2, page_size: PAGE_SIZE })
        )
      );
      return [...first.list, ...rest.flatMap((page) => requireApiData(page).list)];
    },
    enabled,
  });
}
