interface RecordTimelineEntry {
  id: string;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  actor_name: string;
  created_at: string | Date;
}

// One renderer for any record's timeline — shared shape comes from trpc/utils/timeline.ts's TimelineEntry.
export default function RecordTimelineOS({
  entries,
  emptyLabel = "No edits recorded yet.",
}: {
  entries: RecordTimelineEntry[];
  emptyLabel?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {entries.length === 0 && (
        <p className="text-sm text-gray-400">{emptyLabel}</p>
      )}
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-zinc-800"
        >
          <p className="text-gray-700 dark:text-zinc-300">
            <span className="font-semibold">{entry.actor_name}</span> changed{" "}
            <span className="font-mono">{entry.field_changed}</span>
            {entry.old_value || entry.new_value
              ? `: ${entry.old_value ?? "—"} → ${entry.new_value ?? "—"}`
              : ""}
          </p>
          {entry.reason && (
            <p className="mt-0.5 text-gray-400">Reason: {entry.reason}</p>
          )}
          <p className="mt-0.5 text-gray-400">
            {new Date(entry.created_at).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
