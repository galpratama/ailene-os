import { ReactNode } from "react";

export type LabelVariant =
  | "gray"
  | "biru"
  | "kuning"
  | "hijau"
  | "merah"
  | "oranye"
  | "pink";

const variantStyles: Record<
  LabelVariant,
  { text: string; border: string; bg: string }
> = {
  gray: {
    text: "text-gray-600 dark:text-zinc-300",
    border: "border-gray-300 dark:border-zinc-600",
    bg: "bg-gray-100 dark:bg-zinc-800",
  },
  biru: {
    text: "text-[#3a68b0] dark:text-blue-300",
    border: "border-[#a9c3ef] dark:border-blue-800",
    bg: "bg-biru-t dark:bg-blue-950/40",
  },
  kuning: {
    text: "text-[#9a7a1a] dark:text-yellow-300",
    border: "border-[#e8cd7e] dark:border-yellow-800",
    bg: "bg-kuning-t dark:bg-yellow-950/40",
  },
  hijau: {
    text: "text-[#5a8a2a] dark:text-green-300",
    border: "border-[#b9d99a] dark:border-green-800",
    bg: "bg-hijau-t dark:bg-green-950/40",
  },
  merah: {
    text: "text-merah dark:text-red-300",
    border: "border-[#f0b3a5] dark:border-red-800",
    bg: "bg-merah-t dark:bg-red-950/40",
  },
  oranye: {
    text: "text-oranye dark:text-orange-300",
    border: "border-oranye/40 dark:border-orange-800",
    bg: "bg-oranye-t dark:bg-orange-950/40",
  },
  pink: {
    text: "text-[#a0447e] dark:text-pink-300",
    border: "border-[#f0b8dd] dark:border-pink-800",
    bg: "bg-pink-t dark:bg-pink-950/40",
  },
};

interface LabelProps {
  variant: LabelVariant;
  children: ReactNode;
  className?: string;
}

export default function Label({ variant, children, className }: LabelProps) {
  const { text, border, bg } = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold truncate ${text} ${border} ${bg} ${
        className ?? ""
      }`}
    >
      {children}
    </span>
  );
}
