"use client";

import AppSelect from "@/components/fields/AppSelect";

export type LmsChapterOption = {
  id: number;
  name: string;
  sort_order?: number;
};

export function lmsChapterLabel(chapter: LmsChapterOption) {
  return chapter.sort_order
    ? `Chapter ${chapter.sort_order} · ${chapter.name}`
    : chapter.name;
}

export default function LmsChapterPickerOS({
  selectId,
  chapters,
  value,
  onChange,
  error,
  disabled,
}: {
  selectId: string;
  chapters: LmsChapterOption[];
  value: number | null;
  onChange: (chapterId: number | null) => void;
  error?: string | null;
  disabled?: boolean;
}) {
  return (
    <div>
      <AppSelect
        selectId={selectId}
        label="Chapter"
        placeholder="Select chapter"
        required
        disabled={disabled}
        value={value}
        onChange={(next) => onChange(typeof next === "number" ? next : null)}
        options={[...chapters]
          .sort((a, b) => (a.sort_order ?? a.id) - (b.sort_order ?? b.id))
          .map((chapter) => ({ value: chapter.id, label: lmsChapterLabel(chapter) }))}
      />
      {error && <p role="alert" className="mt-1 text-xs text-merah">{error}</p>}
    </div>
  );
}
