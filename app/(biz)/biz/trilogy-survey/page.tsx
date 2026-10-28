import TrilogySurveyPageBIZ from "@/components/pages/TrilogySurveyPageBIZ";
import QueryProvider from "@/contexts/QueryProvider";
import { TRILOGY_SURVEY_TITLE } from "@/lib/trilogy-survey";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: TRILOGY_SURVEY_TITLE,
  description:
    "Survei singkat tools, kebiasaan, dan kemampuan AI peserta program, mengacu pada CFTE AI Proficiency Framework.",
  // Participant-only link, kept out of search results.
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <QueryProvider>
      <TrilogySurveyPageBIZ />
    </QueryProvider>
  );
}
