import {
  Calendar,
  ChartNoAxesCombined,
  GraduationCap,
  LayoutGrid,
  Layers,
  LucideIcon,
  Settings,
  SquareCheckBig,
  Users,
  Wallet,
} from "lucide-react";

export type OSNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

// Shared between SidebarOS (nav links) and HeaderOS (breadcrumb) so the two
// never drift on route -> label mapping.
export const osMainNav: OSNavItem[] = [
  { href: "/", label: "Home", icon: LayoutGrid, exact: true },
  { href: "/leads", label: "Leads · B2B", icon: Users },
  { href: "/tracking", label: "Tracking B2C", icon: ChartNoAxesCombined },
  { href: "/tasks", label: "Tasks", icon: SquareCheckBig },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/trainers", label: "Trainers", icon: GraduationCap },
  { href: "/classes", label: "B2B Classes", icon: Layers },
  { href: "/module", label: "Module", icon: GraduationCap },
  { href: "/revenue", label: "Revenue", icon: Wallet },
];

export const osToolsNav: OSNavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings },
];
