import SprintPageV2BIZ from "@/components/pages/SprintPageV2BIZ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transformation Sprint 10 Minggu: Program Adopsi AI Perusahaan",
  description:
    "Program adopsi AI 10 minggu untuk perusahaan: assessment kesiapan, delapan lab di pekerjaan nyata, use case terverifikasi, Demo Day, dan Rapor AI pertama.",
  alternates: { canonical: "/sprint" },
  openGraph: {
    url: "/sprint",
    title: "Transformation Sprint 10 Minggu | Ailene",
    description: "10 minggu. Ditutup dengan angka: skor sebelum dan sesudah, use case terverifikasi, dan jam dihemat per divisi.",
  },
};

export default function Page() {
  return <SprintPageV2BIZ />;
}
