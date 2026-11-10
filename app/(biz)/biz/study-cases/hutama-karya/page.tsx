import CaseStudyHutamaKaryaPageBIZ from "@/components/pages/CaseStudyHutamaKaryaPageBIZ";
import { CASE_STUDY_PUBLISHED } from "@/lib/biz-case-studies";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const OG_IMAGE = "/biz/case-studies/hutama-karya/hero-how-ai-learn.webp";

export const metadata: Metadata = {
  title: "Studi Kasus Hutama Karya: AI Fundamentals untuk Human Capital",
  description:
    "Bagaimana 36 karyawan Human Capital PT Hutama Karya (Persero) belajar AI dari tugasnya sendiri: skor tes naik rata-rata 11,5 poin di sesi pertama.",
  alternates: { canonical: "/study-cases/hutama-karya" },
  openGraph: {
    url: "/study-cases/hutama-karya",
    title: "Studi Kasus Hutama Karya | Ailene",
    description: "AI Fundamentals untuk tim Human Capital: delapan sesi, aset kerja nyata, dan hasil yang terukur.",
    images: [{ url: OG_IMAGE, width: 1600, height: 900, alt: "Sesi AI Fundamentals bersama tim Human Capital Hutama Karya" }],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function Page() {
  if (!CASE_STUDY_PUBLISHED) notFound();
  return <CaseStudyHutamaKaryaPageBIZ />;
}
