import TrainerApplicationPageBIZ from "@/components/pages/TrainerApplicationPageBIZ";
import JsonLd from "@/components/seo/JsonLd";
import { trainerPageGraph } from "@/lib/structured-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jadi Trainer AI — Daftar Trainer Pool",
  description:
    "Daftar sebagai trainer AI Ailene dan bawakan program AI adoption training untuk tim di berbagai organisasi di Indonesia.",
  keywords: [
    "lowongan trainer AI",
    "jadi trainer AI",
    "trainer pool AI Indonesia",
  ],
  alternates: { canonical: "/join-trainer" },
  openGraph: {
    url: "/join-trainer",
    title: "Jadi Trainer AI di Ailene",
    description:
      "Bantu lebih banyak tim memakai AI secara nyata. Daftar ke trainer pool Ailene.",
  },
};

export default function Page() {
  return (
    <>
      <JsonLd graph={trainerPageGraph()} />
      <TrainerApplicationPageBIZ />
    </>
  );
}
