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

export type OSSegment = "B2B" | "B2C";

export type OSNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  segment: OSSegment;
};

// Nav links rendered in SidebarOS, split by the B2B/B2C segment toggle.
// B2C only surfaces Tracking; every other nav item lives under B2B.
export const osMainNav: OSNavItem[] = [
  { href: "/", label: "Home", icon: LayoutGrid, exact: true, segment: "B2B" },
  { href: "/leads", label: "Leads", icon: Users, segment: "B2B" },
  { href: "/tracking", label: "Tracking", icon: ChartNoAxesCombined, segment: "B2C" },
  { href: "/tasks", label: "Tasks", icon: SquareCheckBig, segment: "B2B" },
  { href: "/calendar", label: "Calendar", icon: Calendar, segment: "B2B" },
  { href: "/trainers", label: "Trainers", icon: GraduationCap, segment: "B2B" },
  { href: "/lms/projects", label: "Corporate Training", icon: FolderKanban, segment: "B2B" },
  { href: "/lms/class-marketplace", label: "Class Marketplace", icon: Store, segment: "B2B" },
];

export const osToolsNav: OSNavItem[] = [];
