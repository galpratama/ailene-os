import {
  Calendar,
  ChartNoAxesCombined,
  FolderKanban,
  GraduationCap,
  LayoutGrid,
  LucideIcon,
  SquareCheckBig,
  Store,
  Users,
} from "lucide-react";

export type OSNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

// Nav links rendered in SidebarOS.
export const osMainNav: OSNavItem[] = [
  { href: "/", label: "Home", icon: LayoutGrid, exact: true },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/tracking", label: "Tracking", icon: ChartNoAxesCombined },
  { href: "/tasks", label: "Tasks", icon: SquareCheckBig },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/trainers", label: "Trainers", icon: GraduationCap },
  { href: "/lms/projects", label: "LMS Projects", icon: FolderKanban },
  { href: "/lms/class-marketplace", label: "Class Marketplace", icon: Store },
];

export const osToolsNav: OSNavItem[] = [];
