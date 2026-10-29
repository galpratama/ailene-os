import Image from "next/image";
import {
  labelVariantStyle,
  type LabelVariant,
} from "@/components/labels/Label";

const typeVariants: Record<string, LabelVariant> = {
  PDF: "merah",
  DOC: "biru",
  DOCX: "biru",
  PPT: "oranye",
  PPTX: "oranye",
  XLS: "hijau",
  XLSX: "hijau",
  CSV: "hijau",
};

export function fileTypeFromUrl(url: string | null) {
  if (!url) return "TEXT";
  try {
    const extension = new URL(url).pathname.split(".").pop() ?? "";
    return /^[a-z0-9]{2,4}$/i.test(extension)
      ? extension.toUpperCase()
      : "LINK";
  } catch {
    return "LINK";
  }
}

// The same PDF artwork Sevenpreneur uses for learning materials.
const PDF_ICON_URL =
  "https://tskubmriuclmbcfmaiur.supabase.co/storage/v1/object/public/sevenpreneur/pdf-icon.webp";

// A folded-corner document with its type tag, in the label colors of that file type.
export default function FileTypeIconOS({ type }: { type: string }) {
  const style = labelVariantStyle(typeVariants[type] ?? "gray");
  if (type === "PDF") {
    return (
      <Image
        src={PDF_ICON_URL}
        alt=""
        aria-hidden="true"
        width={56}
        height={56}
        className="size-14 shrink-0 object-contain"
      />
    );
  }

  return (
    <span
      className="relative flex h-14 w-11 shrink-0 items-end justify-center"
      aria-hidden="true"
    >
      <svg viewBox="0 0 44 56" className="absolute inset-0 size-full">
        <path
          d="M6 1h22l15 15v33a6 6 0 0 1-6 6H6a6 6 0 0 1-6-6V7a6 6 0 0 1 6-6Z"
          className="fill-card-bg stroke-line"
          strokeWidth="1.5"
        />
        <path
          d="M28 1v9a6 6 0 0 0 6 6h9"
          className="fill-none stroke-line"
          strokeWidth="1.5"
        />
      </svg>
      <span
        className="relative mb-2.5 rounded px-1 py-px text-[9px] font-bold leading-tight tracking-wide"
        style={{
          ...style,
          borderWidth: 0,
          backgroundColor: style.color,
          color: "var(--card-bg)",
        }}
      >
        {type}
      </span>
    </span>
  );
}
