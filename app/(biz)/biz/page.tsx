import { listIndustries } from "@/apis/lookup";
import HomePageBIZ from "@/components/pages/HomePageBIZ";
import JsonLd from "@/components/seo/JsonLd";
import { resolveHeroAudience } from "@/lib/biz-content";
import { homePageGraph } from "@/lib/structured-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Training AI untuk Perusahaan & Adopsi AI Tim | Ailene",
  },
  description:
    "Program training AI untuk perusahaan di Indonesia: workshop per divisi, LMS untuk memantau progres, dan Demo Day. Dari pelatihan sampai adopsi yang terukur.",
  keywords: [
    "training AI untuk perusahaan",
    "pelatihan AI korporat",
    "AI adoption training",
    "workshop AI perusahaan",
    "in-house training AI Indonesia",
  ],
  // Self-referencing: ads land here with UTM params, and the apex serves this too.
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    title: "Training AI untuk Perusahaan & Adopsi AI Tim | Ailene",
    description:
      "Workshop AI dipandu per divisi, progres terpantau di LMS, ditutup dengan Demo Day di depan leadership.",
  },
};

// A lookup outage must never fail this page or the build, so the form just drops the field.
async function loadIndustries() {
  try {
    const result = await listIndustries({ page: 1, page_size: 100 });
    return result.data?.list ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string | string[] }>;
}) {
  // Resolved on the server so the audience headline is in the first HTML, not swapped in after load.
  const [industries, { audience }] = await Promise.all([loadIndustries(), searchParams]);

  return (
    <>
      <JsonLd graph={homePageGraph()} />
      <HomePageBIZ industries={industries} audience={resolveHeroAudience(audience)} />
    </>
  );
}
