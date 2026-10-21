import Image from "next/image";

interface RecordTimelineEntry {
  id: string;
  field_changed: string;
  is_creation?: boolean;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  actor_name: string;
  actor_avatar: string | null;
  created_at: string | Date;
}

// One renderer for any record's timeline, whatever the source of the entries.
export default function RecordTimelineOS({
  entries,
  emptyLabel = "No edits recorded yet.",
}: {
  entries: RecordTimelineEntry[];
  emptyLabel?: string;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-400">{emptyLabel}</p>;
  }

  return (
    <ol>
      {entries.map((entry, index) => {
        const actorName = entry.actor_name?.trim() || "Unknown user";
        const initials = actorName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
        const createdAt = new Date(entry.created_at);

        return (
          <li key={entry.id} className="relative pb-5 pl-7 last:pb-0">
            {index < entries.length - 1 && (
              <span aria-hidden="true" className="absolute left-1.5 top-3 h-full w-px bg-line-soft" />
            )}
            <span aria-hidden="true" className="absolute left-0 top-1.5 flex size-3 items-center justify-center rounded-full border border-line bg-card-bg">
              <span className="size-1.5 rounded-full bg-claude dark:bg-lime-bright" />
            </span>

            <div className="flex min-w-0 items-center gap-2">
              {entry.actor_avatar ? (
                <Image src={entry.actor_avatar} alt="" width={28} height={28} className="size-7 shrink-0 rounded-full object-cover" />
              ) : (
                <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-dashboard-bg text-[10px] font-semibold text-gray-600 dark:text-zinc-300">
                  {initials}
                </span>
              )}
              <span className="min-w-0 wrap-break-word text-xs font-semibold text-gray-800 dark:text-zinc-200">{actorName}</span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-gray-600 dark:text-zinc-300">
              {entry.is_creation ? "Created with" : "Changed"} {entry.field_changed}
              {entry.is_creation
                ? (entry.new_value ? `: ${entry.new_value}` : "")
                : (entry.old_value || entry.new_value
                  ? `: ${entry.old_value ?? "—"} → ${entry.new_value ?? "—"}`
                  : "")}
            </p>
            {entry.reason && (
              <p className="mt-1 wrap-break-word text-xs text-gray-500 dark:text-zinc-400">{entry.reason}</p>
            )}
            <time dateTime={createdAt.toISOString()} className="mt-1 block text-xs text-gray-400 dark:text-zinc-500">
              {createdAt.toLocaleString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta",
              })} WIB
            </time>
          </li>
        );
      })}
    </ol>
  );
}
