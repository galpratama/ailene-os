import { initialsOf } from "@/lib/tasks";
import Image from "next/image";

const sizeStyles = {
  sm: { className: "size-5.5 text-[10px]", pixels: 22 },
  md: { className: "size-6 text-[10px]", pixels: 24 },
  lg: { className: "size-10 text-xs", pixels: 40 },
};

export default function TaskAssigneeAvatarOS({
  name,
  avatar,
  size = "sm",
}: {
  name: string | null;
  avatar: string | null;
  size?: keyof typeof sizeStyles;
}) {
  const { className, pixels } = sizeStyles[size];

  return (
    <div
      className={`flex ${className} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 font-semibold text-gray-500 dark:bg-zinc-700 dark:text-zinc-300`}
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
