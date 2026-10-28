import { ReactNode } from "react";

export type LabelVariant =
  | "gray"
  | "biru"
  | "kuning"
  | "hijau"
  | "merah"
  | "oranye"
  | "pink"
  | "ungu"
  | "toska";

const variantStyles: Record<
  LabelVariant,
  { text: string; border: string; bg: string }
> = {
  gray: {
    text: "text-gray-600 dark:text-zinc-300",
    border: "border-line",
    bg: "bg-gray-100/50 dark:bg-zinc-800/50",
  },
  biru: {
    text: "text-[#3a68b0] dark:text-blue-300",
    border: "border-biru/30 dark:border-blue-400/20",
    bg: "bg-biru-t/40 dark:bg-blue-500/10",
  },
  kuning: {
    text: "text-[#9a7a1a] dark:text-yellow-300",
    border: "border-kuning/30 dark:border-yellow-400/20",
    bg: "bg-kuning-t/40 dark:bg-yellow-500/10",
  },
  hijau: {
    text: "text-[#5a8a2a] dark:text-green-300",
    border: "border-hijau/30 dark:border-green-400/20",
    bg: "bg-hijau-t/40 dark:bg-green-500/10",
  },
  merah: {
    text: "text-merah dark:text-red-300",
    border: "border-merah/30 dark:border-red-400/20",
    bg: "bg-merah-t/40 dark:bg-red-500/10",
  },
  oranye: {
    text: "text-oranye dark:text-orange-300",
    border: "border-oranye/30 dark:border-orange-400/20",
    bg: "bg-oranye-t/40 dark:bg-orange-500/10",
  },
  pink: {
    text: "text-[#a0447e] dark:text-pink-300",
    border: "border-pink/30 dark:border-pink-400/20",
    bg: "bg-pink-t/40 dark:bg-pink-500/10",
  },
  ungu: {
    text: "text-[#7c5cc4] dark:text-purple-300",
    border: "border-ungu/30 dark:border-purple-400/20",
    bg: "bg-ungu-t/40 dark:bg-purple-500/10",
  },
  toska: {
    text: "text-[#0f9b8e] dark:text-teal-300",
    border: "border-toska/30 dark:border-teal-400/20",
    bg: "bg-toska-t/40 dark:bg-teal-500/10",
  },
};

interface LabelProps {
  variant: LabelVariant;
  children: ReactNode;
  className?: string;
}

// Shared with compact cells that must match label colors without being pills.
export function labelVariantClassName(variant: LabelVariant) {
  const { text, border, bg } = variantStyles[variant];
  return `${text} ${border} ${bg}`;
}

export default function Label({ variant, children, className }: LabelProps) {
  const { text, border, bg } = variantStyles[variant];

  return (
    <span
      className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold truncate ${text} ${border} ${bg} ${
        className ?? ""
      }`}
    >
      {children}
    </span>
  );
}
