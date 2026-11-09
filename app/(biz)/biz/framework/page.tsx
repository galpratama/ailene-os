import FrameworkPageBIZ from "@/components/pages/FrameworkPageBIZ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Framework Training AI: CFTE & Kirkpatrick",
  description:
    "Training AI Ailene memakai peta kemampuan CFTE dan piramida evaluasi Kirkpatrick: dari titik awal peserta, praktik nyata, sampai bukti penerapan di pekerjaan.",
  alternates: { canonical: "/framework" },
  openGraph: {
    url: "/framework",
    title: "Framework Training AI | Ailene",
    description: "Dari peta kemampuan ke bukti perubahan di tempat kerja.",
  },
};

export default function Page() {
  return <FrameworkPageBIZ />;
}
