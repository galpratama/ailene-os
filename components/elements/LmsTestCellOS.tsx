import type { LmsMemberTestResult } from "@/apis/lms";
import { labelVariantStyle } from "@/components/labels/Label";
import { formatScore, scoreVariant } from "@/lib/lms-insights";
import { Check } from "lucide-react";

function describe(kind: string, test: LmsMemberTestResult | null) {
  if (!test) return `${kind}: no test`;
  if (!test.submitted) return `${kind}: not submitted`;
  return `${kind}: ${test.score === null ? "submitted" : `score ${formatScore(test.score)}`}`;
}

function TestSquare({ test, label }: { test: LmsMemberTestResult | null; label: string }) {
  const base = "flex size-7 items-center justify-center rounded-md border text-[11px] font-semibold tabular-nums";
  if (!test) {
    return <span className={`${base} border-transparent text-gray-300 dark:text-zinc-600`} aria-label={label}>·</span>;
  }
  if (!test.submitted) {
    return <span className={`${base} border-dashed border-line text-gray-400 dark:text-zinc-500`} aria-label={label} />;
  }
  return (
    <span
      className={base}
      style={labelVariantStyle(test.score === null ? "hijau" : scoreVariant(test.score))}
      aria-label={label}
    >
      {test.score === null ? <Check size={13} /> : formatScore(test.score)}
    </span>
  );
}

export default function LmsTestCellOS({
  chapterName,
  preTest,
  postTest,
  scheduled,
}: {
  chapterName: string;
  preTest: LmsMemberTestResult | null;
  postTest: LmsMemberTestResult | null;
  scheduled: boolean;
}) {
  if (!scheduled) {
    return <span className="block text-center text-xs text-gray-300 dark:text-zinc-600" title={`${chapterName}: not scheduled for this group`}>—</span>;
  }
  const pre = describe("Pre-test", preTest);
  const post = describe("Post-test", postTest);
  return (
    <span className="flex items-center justify-center gap-1" title={`${chapterName}\n${pre}\n${post}`}>
      <TestSquare test={preTest} label={pre} />
      <TestSquare test={postTest} label={post} />
    </span>
  );
}
