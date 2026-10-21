import TaskAssigneeAvatarOS from "@/components/elements/TaskAssigneeAvatarOS";

export default function LmsLearnerCellOS({
  name,
  avatar,
  caption,
}: {
  name: string;
  avatar: string | null;
  caption?: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <TaskAssigneeAvatarOS name={name} avatar={avatar} size="md" />
      <div className="min-w-0">
        <p className="truncate font-semibold text-gray-900 dark:text-zinc-100">{name}</p>
        {caption && <p className="truncate text-xs text-gray-400">{caption}</p>}
      </div>
    </div>
  );
}
