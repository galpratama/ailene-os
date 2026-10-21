"use client";

import AppRichTextEditor from "@/components/fields/AppRichTextEditor";
import AppTextArea from "@/components/fields/AppTextArea";
import { useState } from "react";

export default function LmsMaterialEditorOS({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  // Preserve existing Markdown instead of silently interpreting it as rich-text HTML.
  const [markdown] = useState(
    () =>
      !!value.trim() &&
      !/<(?:p|h[1-6]|ul|ol|blockquote|div|table)\b/i.test(value),
  );
  if (markdown)
    return (
      <div className="flex flex-col gap-2">
        <AppTextArea
          textAreaId="lms-material-body"
          label="Learning material (Markdown)"
          disabled={disabled}
          rows={16}
          characterLength={500000}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Write your learning material..."
        />
        <p className="text-xs text-gray-500 dark:text-zinc-400">
          This material uses Markdown. Use # for headings, - for lists, and
          [text](URL) for links.
        </p>
      </div>
    );
  return (
    <AppRichTextEditor
      editorId="lms-material-body"
      label="Learning material"
      disabled={disabled}
      placeholder="Write the lesson, add headings, lists, and links..."
      value={value}
      onChange={onChange}
    />
  );
}
