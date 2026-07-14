import HomePageBIZ from "@/components/pages/HomePageBIZ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ailene B2B | Corporate AI Training Menu",
  description:
    "Corporate AI training menu untuk tim kamu — Foundation, Intensive, atau Transformation Sprint. Konsultasikan program yang paling relevan dengan kebutuhan tim.",
};

export default function HomePage() {
  return <HomePageBIZ />;
}
