import TrainerApplicationPageBIZ from "@/components/pages/TrainerApplicationPageBIZ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join Trainer Pool · Ailene",
  description:
    "Daftar sebagai trainer Ailene dan bantu lebih banyak tim memakai AI secara nyata.",
};

export default function Page() {
  return <TrainerApplicationPageBIZ />;
}
