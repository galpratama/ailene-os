import HomePageBIZ from "@/components/pages/HomePageBIZ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ailene | AI Adoption Training for Organizations",
  description:
    "Ailene membantu organisasi bergerak dari AI training menuju adopsi yang terlihat, terukur, dan berlanjut di pekerjaan sehari-hari.",
};

export default function HomePage() {
  return <HomePageBIZ />;
}
