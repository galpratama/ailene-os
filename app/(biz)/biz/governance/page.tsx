import GovernancePageV2BIZ from "@/components/pages/GovernancePageV2BIZ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keamanan Data dan UU PDP dalam Program AI",
  description:
    "Kebijakan penggunaan AI selaras UU PDP, AI di tenant perusahaan Anda, data disamarkan di setiap lab, serta NDA dan DPA sebelum hari pertama.",
  alternates: { canonical: "/governance" },
  openGraph: {
    url: "/governance",
    title: "Keamanan Data dan UU PDP | Ailene",
    description: "Aman untuk enterprise. Dibangun untuk Indonesia.",
  },
};

export default function Page() {
  return <GovernancePageV2BIZ />;
}
