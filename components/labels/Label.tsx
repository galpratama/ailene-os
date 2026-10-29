import type { CSSProperties, ReactNode } from "react";

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

interface LabelProps {
  variant: LabelVariant;
  children: ReactNode;
  className?: string;
}

// Shared with compact cells that must match label colors without being pills.
export function labelVariantStyle(variant: LabelVariant): CSSProperties {
  return {
    color: `var(--label-${variant})`,
    borderColor: `var(--label-${variant}-border)`,
    backgroundColor: `var(--label-${variant}-bg)`,
  };
}

export default function Label({ variant, children, className }: LabelProps) {
  return (
    <span
      style={labelVariantStyle(variant)}
      className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold truncate ${
        className ?? ""
      }`}
    >
      {children}
    </span>
  );
}
