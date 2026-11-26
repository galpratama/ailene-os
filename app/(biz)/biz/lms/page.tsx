import LmsPageV2BIZ from "@/components/pages/LmsPageV2BIZ";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LMS untuk Melacak Adopsi AI Karyawan",
  description:
    "LMS dengan logo dan kurikulum perusahaan Anda: level, XP, use case terverifikasi, dan tampilan Direksi untuk melacak adopsi AI per karyawan dan per divisi.",
  alternates: { canonical: "/lms" },
  openGraph: {
    url: "/lms",
    title: "LMS Pelacak Adopsi AI | Ailene",
    description: "Karyawan naik level seperti di game. Direksi melihat siapa yang benar-benar memakai AI, dan berapa jam yang dihemat.",
  },
};

export default function Page() {
  return <LmsPageV2BIZ />;
}
