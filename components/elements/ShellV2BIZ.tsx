import FooterV2BIZ from "@/components/navigations/FooterV2BIZ";
import HeaderV2BIZ from "@/components/navigations/HeaderV2BIZ";
import type { V2Page } from "@/lib/biz-home-v2";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

// Type, header and footer shared by the v2 home and its secondary pages.
export default function ShellV2BIZ({ page, children }: { page: V2Page; children: ReactNode }) {
  return (
    <div
      id="top"
      className={`${plusJakarta.variable} bg-v2-paper font-jakarta text-[17px] leading-[1.6] text-v2-ink antialiased selection:bg-v2-lime selection:text-v2-forest [&_[id]]:scroll-mt-21`}
    >
      <HeaderV2BIZ page={page} />
      <main>{children}</main>
      <FooterV2BIZ page={page} />
    </div>
  );
}
