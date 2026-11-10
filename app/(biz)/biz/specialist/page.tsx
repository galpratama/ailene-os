import SpecialistPageBIZ from "@/components/pages/SpecialistPageBIZ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Training AI per Divisi: Executive, Sales, Marketing, HR, IT, Legal",
  description:
    "Training AI Ailene disesuaikan per divisi: use case, hasil lab, dan ukuran keberhasilan berbeda untuk Executive, Sales, Marketing, HR, Finance, Operations, IT, Legal, dan Customer Service.",
  alternates: { canonical: "/specialist" },
  openGraph: {
    url: "/specialist",
    title: "Training AI per Divisi | Ailene",
    description: "Setiap divisi praktik di tugas, tools, dan risikonya sendiri.",
  },
};

export default function Page() {
  return <SpecialistPageBIZ />;
}
