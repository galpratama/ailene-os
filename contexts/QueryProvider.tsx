"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

// One client per browser tab; server renders never share a cache between requests.
export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30 * 1000 } } })
  );
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
