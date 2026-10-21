"use client";

import AppButton from "@/components/buttons/AppButton";
import { RefreshCw, TriangleAlert } from "lucide-react";

export default function LmsInsightErrorOS({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-card-bg px-6 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-merah/10 text-merah">
        <TriangleAlert size={20} />
      </span>
      <p className="text-sm text-gray-600 dark:text-zinc-300">{message}</p>
      <AppButton variant="secondary" size="sm" type="button" onClick={onRetry}>
        <RefreshCw size={13} /> Try again
      </AppButton>
    </div>
  );
}
