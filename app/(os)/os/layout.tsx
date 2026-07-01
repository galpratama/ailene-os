import HeaderOS from "@/components/navigations/HeaderOS";
import SidebarOS from "@/components/navigations/SidebarOS";
import type { ReactNode } from "react";

export default function OSLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <SidebarOS />
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-50">
        <HeaderOS />
        <main className="flex-1 overflow-auto bg-neutral-50">{children}</main>
      </div>
    </div>
  );
}
