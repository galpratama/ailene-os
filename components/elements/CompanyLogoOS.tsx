import { avatarVariant } from "@/components/elements/TaskAssigneeAvatarOS";
import { labelVariantStyle } from "@/components/labels/Label";
import { initialsOf } from "@/lib/tasks";
import Image from "next/image";

const sizeStyles = {
  sm: { className: "size-7 text-[10px]", pixels: 28 },
  md: { className: "size-9 text-xs", pixels: 36 },
  lg: { className: "size-12 text-sm", pixels: 48 },
};

// Companies are rounded squares and people are circles, so the two never read as the same thing.
export default function CompanyLogoOS({
  name,
  imageUrl,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  size?: keyof typeof sizeStyles;
}) {
  const { className, pixels } = sizeStyles[size];
  if (imageUrl) {
    return (
      <span className={`flex ${className} shrink-0 overflow-hidden rounded-lg border border-line bg-white`}>
        <Image src={imageUrl} alt={`Logo ${name}`} width={pixels} height={pixels} className="size-full object-contain" />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      style={labelVariantStyle(avatarVariant(name))}
      className={`flex ${className} shrink-0 items-center justify-center rounded-lg border font-semibold`}
    >
      {initialsOf(name)}
    </span>
  );
}
