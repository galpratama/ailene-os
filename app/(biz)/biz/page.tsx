import HomePageBIZ from "@/components/pages/HomePageBIZ";
import JsonLd from "@/components/seo/JsonLd";
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

export default function HomePage() {
  return (
    <>
      <JsonLd graph={homePageGraph()} />
      <HomePageBIZ />
    </>
  );
}
