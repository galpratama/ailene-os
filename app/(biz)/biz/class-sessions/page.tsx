import ClassSessionListPageBIZ from "@/components/pages/ClassSessionListPageBIZ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sesi Kelas B2B Terbuka · Ailene",
  description:
    "Lihat sesi kelas B2B yang sedang terbuka untuk aplikasi trainer di Ailene.",
};

export default function Page() {
  return <ClassSessionListPageBIZ />;
}
