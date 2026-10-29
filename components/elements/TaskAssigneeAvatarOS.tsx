import { initialsOf } from "@/lib/tasks";
import {
  labelVariantStyle,
  type LabelVariant,
} from "@/components/labels/Label";
import Image from "next/image";

const sizeStyles = {
  sm: { className: "size-5.5 text-[10px]", pixels: 22 },
  md: { className: "size-6 text-[10px]", pixels: 24 },
  base: { className: "size-8 text-[11px]", pixels: 32 },
  lg: { className: "size-10 text-xs", pixels: 40 },
};

const avatarVariants: LabelVariant[] = [
  "biru",
  "hijau",
  "ungu",
  "oranye",
  "pink",
  "toska",
  "merah",
  "kuning",
];

function avatarVariant(value: string) {
  const hash = Array.from(value).reduce(
    (total, character) => total + character.codePointAt(0)!,
    0,
  );
  return avatarVariants[hash % avatarVariants.length];
}

export default function TaskAssigneeAvatarOS({
  name,
  avatar,
  size = "sm",
  colorKey,
}: {
  name: string | null;
  avatar: string | null;
  size?: keyof typeof sizeStyles;
  colorKey?: string | null;
}) {
  const { className, pixels } = sizeStyles[size];
  const coloredFallback = !avatar && colorKey;

  return (
    <div
      style={
        coloredFallback
          ? labelVariantStyle(avatarVariant(colorKey))
          : undefined
      }
      className={`flex ${className} shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ${
        coloredFallback
          ? "border"
          : "bg-gray-100 text-gray-500 dark:bg-zinc-700 dark:text-zinc-300"
      }`}
    >
      {avatar ? (
        <Image
          src={avatar}
          alt={name ?? ""}
          width={pixels}
          height={pixels}
          className="size-full object-cover"
        />
      ) : (
        initialsOf(name)
      )}
    </div>
  );
}
