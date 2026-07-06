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
  gray: { text: "text-gray-600", border: "border-gray-300", bg: "bg-gray-100" },
  biru: { text: "text-[#3a68b0]", border: "border-[#a9c3ef]", bg: "bg-biru-t" },
  kuning: { text: "text-[#9a7a1a]", border: "border-[#e8cd7e]", bg: "bg-kuning-t" },
  hijau: { text: "text-[#5a8a2a]", border: "border-[#b9d99a]", bg: "bg-hijau-t" },
  merah: { text: "text-merah", border: "border-[#f0b3a5]", bg: "bg-merah-t" },
  oranye: { text: "text-oranye", border: "border-oranye/40", bg: "bg-oranye-t" },
  pink: { text: "text-[#a0447e]", border: "border-[#f0b8dd]", bg: "bg-pink-t" },
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
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold truncate ${text} ${border} ${bg} ${
        className ?? ""
      }`}
    >
      {children}
    </span>
  );
}
