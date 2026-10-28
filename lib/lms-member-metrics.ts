import type { LmsMemberMetricsEntry, LmsMemberTestResult } from "@/apis/lms";

export type LmsChapterColumn = { chapterId: number; chapterName: string; firstDate: string };

export type LmsMetricsSummary = {
  participants: number;
  preAssessmentDone: number;
  preTestDone: number;
  preTestTotal: number;
  postTestDone: number;
  postTestTotal: number;
};

// Members of different groups can hold different sessions, so columns are the union ordered by earliest session.
export function lmsChapterColumns(entries: LmsMemberMetricsEntry[]): LmsChapterColumn[] {
  const columns = new Map<number, LmsChapterColumn>();
  for (const entry of entries) {
    for (const session of entry.sessions) {
      const column = columns.get(session.chapter_id);
      if (!column || session.session_date < column.firstDate) {
        columns.set(session.chapter_id, {
          chapterId: session.chapter_id,
          chapterName: session.chapter_name,
          firstDate: session.session_date,
        });
      }
    }
  }
  return [...columns.values()].sort(
    (a, b) => a.firstDate.localeCompare(b.firstDate) || a.chapterId - b.chapterId,
  );
}

// Sponsors do not take assessments, so they are left out of completion rates.
export function lmsMetricsSummary(entries: LmsMemberMetricsEntry[]): LmsMetricsSummary {
  const summary: LmsMetricsSummary = {
    participants: 0,
    preAssessmentDone: 0,
    preTestDone: 0,
    preTestTotal: 0,
    postTestDone: 0,
    postTestTotal: 0,
  };
  const count = (test: LmsMemberTestResult | null, kind: "preTest" | "postTest") => {
    if (!test) return;
    summary[`${kind}Total`] += 1;
    if (test.submitted) summary[`${kind}Done`] += 1;
  };
  for (const entry of entries) {
    if (entry.role === "sponsor") continue;
    summary.participants += 1;
    if (entry.pre_assessment.status !== "not_started") summary.preAssessmentDone += 1;
    for (const session of entry.sessions) {
      count(session.pre_test, "preTest");
      count(session.post_test, "postTest");
    }
  }
  return summary;
}
