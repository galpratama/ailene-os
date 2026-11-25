import type { RaporStatus } from "@/lib/biz-home-v2";

const statusStyle: Record<RaporStatus, { label: string; className: string }> = {
  ok: { label: "Sesuai target", className: "bg-v2-green-soft text-v2-green" },
  warn: { label: "Perlu pendampingan", className: "bg-v2-amber-soft text-v2-amber" },
  risk: { label: "Berisiko", className: "bg-v2-red-soft text-v2-red" },
};

// Rapor AI traffic light: green on target, amber needs support, red at risk.
export default function RaporStatusLabelBIZ({
  status,
  size = "md",
  label: override,
}: {
  status: RaporStatus;
  size?: "sm" | "md";
  // Same traffic light with another wording, e.g. a policy's "Boleh" / "Tidak boleh".
  label?: string;
}) {
  const { label, className } = statusStyle[status];
  return (
    <span
      className={`inline-flex items-center gap-[0.45em] whitespace-nowrap rounded-full py-[0.22em] pr-[0.62em] pl-[0.5em] leading-[1.3] font-bold transition-colors duration-500 before:size-[0.5em] before:rounded-full before:bg-current ${
        size === "sm" ? "text-[0.72rem]" : "text-[0.78rem]"
      } ${className}`}
    >
      {override ?? label}
    </span>
  );
}
