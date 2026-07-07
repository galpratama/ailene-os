"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type SidebarContextType = {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (value: boolean) => void;
  // Mobile off-canvas drawer state — independent of desktop collapse, since
  // on mobile the sidebar is either fully hidden or fully shown as an overlay.
  isMobileOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  // Always start expanded so the client's first render matches the server's
  // (which has no access to localStorage) — read the saved value after mount
  // instead of during the initial render to avoid a hydration mismatch.
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsCollapsed(localStorage.getItem("sidebar_collapsed") === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        setCollapsed: setIsCollapsed,
        isMobileOpen,
        openMobileSidebar: () => setIsMobileOpen(true),
        closeMobileSidebar: () => setIsMobileOpen(false),
        toggleMobileSidebar: () => setIsMobileOpen((prev) => !prev),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
