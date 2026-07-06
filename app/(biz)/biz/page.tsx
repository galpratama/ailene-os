import HomePageBIZ from "@/components/pages/HomePageBIZ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ailene — Belajar AI dari Nol, Gratis",
  description:
    "Komunitas belajar AI gratis di Indonesia. Kurikulum runtut dari nol, komunitas ribuan orang, dan sertifikat tiap kelar level.",
};

export default function HomePage() {
  return <HomePageBIZ />;
}
