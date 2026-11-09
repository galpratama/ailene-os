import AppButton from "@/components/buttons/AppButton";
import { TriangleAlert } from "lucide-react";

export default function RevenueErrorOS({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-line bg-card-bg p-8 text-center">
      <TriangleAlert size={22} className="text-merah" aria-hidden="true" />
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">These figures could not be loaded</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-zinc-400">{error instanceof Error ? error.message : "The analytics API did not respond."}</p>
      </div>
      <AppButton type="button" variant="outline" size="sm" onClick={onRetry}>Try again</AppButton>
    </div>
  );
}
