import HomePageBIZ from "@/components/pages/HomePageBIZ";
import JsonLd from "@/components/seo/JsonLd";
import { resolveHeroAudience, resolveHeroDisplay } from "@/lib/biz-content";
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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ audience?: string | string[]; display?: string | string[] }>;
}) {
  // Resolved on the server so the audience headline and hero visual are in the first HTML, not swapped in after load.
  const { audience, display } = await searchParams;

  return (
    <>
      <JsonLd graph={homePageGraph()} />
      <HomePageBIZ
        audience={resolveHeroAudience(audience)}
        display={resolveHeroDisplay(display)}
      />
    </>
  );
}
