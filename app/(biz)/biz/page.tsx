import HomeExperimentBIZ from "@/components/analytics/HomeExperimentBIZ";
import HomePageBIZ from "@/components/pages/HomePageBIZ";
import HomePageV2BIZ from "@/components/pages/HomePageV2BIZ";
import JsonLd from "@/components/seo/JsonLd";
import { resolveHomeVariant } from "@/lib/biz-experiment";
import { resolveHeroAudience, resolveHeroDisplay } from "@/lib/biz-content";
import { BIZ_HOME_VARIANT_COOKIE } from "@/lib/constants";
import { homePageGraph } from "@/lib/structured-data";
import type { Metadata } from "next";
import { cookies } from "next/headers";

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
  searchParams: Promise<{
    audience?: string | string[];
    display?: string | string[];
    home?: string | string[];
  }>;
}) {
  // Resolved on the server so the audience headline and hero visual are in the first HTML, not swapped in after load.
  const { audience, display, home } = await searchParams;
  const { variant, persist } = resolveHomeVariant(
    home,
    (await cookies()).get(BIZ_HOME_VARIANT_COOKIE)?.value
  );

  return (
    <>
      <JsonLd graph={homePageGraph()} />
      <HomeExperimentBIZ variant={variant} persist={persist} />
      {variant === "b" ? (
        <HomePageV2BIZ />
      ) : (
        <HomePageBIZ
          audience={resolveHeroAudience(audience)}
          display={resolveHeroDisplay(display)}
        />
      )}
    </>
  );
}
