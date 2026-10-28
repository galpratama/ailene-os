import ProgressBar from "@/components/labels/ProgressBar";
import type { LmsMetricsSummary } from "@/lib/lms-member-metrics";

function percent(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : null;
}

function MetricTile({ label, done, total, unit }: { label: string; done: number; total: number; unit: string }) {
  const value = percent(done, total);
  return (
    <div className="rounded-xl border border-line-soft px-4 py-3">
      <p className="text-xs font-medium text-gray-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 flex items-baseline gap-1.5">
        <span className="font-heading text-2xl text-gray-900 tabular-nums dark:text-zinc-100">{value === null ? "—" : `${value}%`}</span>
        <span className="text-xs text-gray-500 tabular-nums dark:text-zinc-400">{done}/{total} {unit}</span>
      </p>
      <ProgressBar value={done} total={total} className="mt-2" />
    </div>
  );
}

export default function LmsMemberMetricsSummaryOS({ summary }: { summary: LmsMetricsSummary }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <MetricTile label="Pre-assessment completed" done={summary.preAssessmentDone} total={summary.participants} unit="participants" />
      <MetricTile label="Pre-tests submitted" done={summary.preTestDone} total={summary.preTestTotal} unit="tests" />
      <MetricTile label="Post-tests submitted" done={summary.postTestDone} total={summary.postTestTotal} unit="tests" />
    </div>
  );
}
