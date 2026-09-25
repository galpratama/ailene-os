import {
  BookOpen,
  Building2,
  Calculator,
  Calendar,
  ChartNoAxesCombined,
  FileText,
  GraduationCap,
  LayoutGrid,
  LucideIcon,
  Settings,
  ShieldCheck,
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
  // Access-role names allowed to see this item; omit for no gating.
  minRoles?: string[];
  // Sub-section label rendered like "Tools"; omit for top-level.
  group?: string;
};

// SidebarOS nav, split by the B2B/B2C toggle (B2C has only Tracking); a shared `group` clusters items into a labeled sub-section.
export const osMainNav: OSNavItem[] = [
  { href: "/", label: "Home", icon: LayoutGrid, exact: true, segment: "B2B" },
  { href: "/calendar", label: "Calendar", icon: Calendar, segment: "B2B" },
  {
    href: "/analytics",
    label: "Analytics",
    icon: ChartNoAxesCombined,
    segment: "B2B",
  },
  { href: "/tracking", label: "Tracking", icon: ChartNoAxesCombined, segment: "B2C" },
  {
    href: "/organizations",
    label: "Organizations",
    icon: Building2,
    segment: "B2B",
    group: "Business Development",
  },
  {
    href: "/leads/sdr",
    label: "SDR Leads",
    icon: Users,
    segment: "B2B",
    group: "Business Development",
  },
  {
    href: "/leads/bdr",
    label: "BDR Leads",
    icon: Users,
    segment: "B2B",
    group: "Business Development",
  },
  {
    href: "/tasks",
    label: "Tasks",
    icon: SquareCheckBig,
    segment: "B2B",
    group: "Business Development",
  },
  {
    href: "/quotations",
    label: "Quotations",
    icon: FileText,
    segment: "B2B",
    group: "Business Development",
  },
  {
    href: "/pricing",
    label: "Pricing Calculator",
    icon: Calculator,
    segment: "B2B",
    group: "Business Development",
  },
  {
    href: "/lms",
    label: "LMS",
    icon: BookOpen,
    segment: "B2B",
    group: "LMS",
  },
  {
    href: "/trainers",
    label: "Trainers",
    icon: GraduationCap,
    segment: "B2B",
    group: "Trainer Pool",
  },
  {
    href: "/lms/class-marketplace",
    label: "Class Marketplace",
    icon: Store,
    segment: "B2B",
    group: "Trainer Pool",
  },
  {
    href: "/users",
    label: "Users & access",
    icon: ShieldCheck,
    segment: "B2B",
    minRoles: ["ADMINISTRATOR"],
    group: "Administrator",
  },
];

export const osToolsNav: OSNavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings, segment: "B2B" },
];
