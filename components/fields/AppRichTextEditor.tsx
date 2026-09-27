"use client";

import { fieldLabelClass } from "@/lib/field-styles";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  LucideIcon,
  Quote,
  Redo,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import { useEffect } from "react";

interface AppRichTextEditorProps {
  editorId: string;
  label?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (html: string) => void;
}

type ToolbarItem = {
  label: string;
  icon: LucideIcon;
  run: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
};

const toolbarGroups: ToolbarItem[][] = [
  [
    { label: "Undo", icon: Undo, run: (e) => e.chain().focus().undo().run() },
    { label: "Redo", icon: Redo, run: (e) => e.chain().focus().redo().run() },
  ],
  [
    {
      label: "Bold",
      icon: Bold,
      run: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive("bold"),
    },
    {
      label: "Italic",
      icon: Italic,
      run: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive("italic"),
    },
    {
      label: "Underline",
      icon: UnderlineIcon,
      run: (e) => e.chain().focus().toggleUnderline().run(),
      isActive: (e) => e.isActive("underline"),
    },
    {
      label: "Link",
      icon: LinkIcon,
      run: (e) => {
        if (e.isActive("link")) {
          e.chain().focus().unsetLink().run();
          return;
        }
        const href = window.prompt("Link URL (https://...)");
        if (href) e.chain().focus().extendMarkRange("link").setLink({ href }).run();
      },
      isActive: (e) => e.isActive("link"),
    },
  ],
  [
    {
      label: "Heading 2",
      icon: Heading2,
      run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e) => e.isActive("heading", { level: 2 }),
    },
    {
      label: "Heading 3",
      icon: Heading3,
      run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e) => e.isActive("heading", { level: 3 }),
    },
    {
      label: "Quote",
      icon: Quote,
      run: (e) => e.chain().focus().toggleBlockquote().run(),
      isActive: (e) => e.isActive("blockquote"),
    },
  ],
  [
    {
      label: "Bullet list",
      icon: List,
      run: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive("bulletList"),
    },
    {
      label: "Numbered list",
      icon: ListOrdered,
      run: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive("orderedList"),
    },
  ],
];

// TipTap editor emitting plain HTML; the API sanitizes it again before it reaches the public site.
export default function AppRichTextEditor({
  editorId,
  label,
  required,
  placeholder = "Write something...",
  value,
  onChange,
}: AppRichTextEditorProps) {
  const editor = useEditor({
    // Server render has no DOM; let the client mount it to avoid a hydration mismatch.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    editorProps: {
      attributes: {
        id: editorId,
        class: "article-prose min-h-52 px-3 py-3 text-sm focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // Re-render the toolbar on selection changes so active states stay accurate.
  const activeStates = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? toolbarGroups.flat().map((item) => item.isActive?.(editor) ?? false)
        : [],
  });

  // Pick up a value set from outside (e.g. an edit form loading its article) without echoing our own updates.
  useEffect(() => {
    if (!editor) return;
    const current = editor.isEmpty ? "" : editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  let itemIndex = 0;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={editorId} className={fieldLabelClass}>
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="overflow-hidden rounded-lg border border-gray-300 bg-gray-50 focus-within:border-claude focus-within:ring-2 focus-within:ring-claude/30 dark:border-zinc-700 dark:bg-zinc-800">
        <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-white px-1.5 py-1 dark:border-zinc-700 dark:bg-zinc-900">
          {toolbarGroups.map((group, groupIndex) => (
            <div
              key={groupIndex}
              className="flex items-center gap-0.5 border-r border-gray-200 pr-1 last:border-0 dark:border-zinc-700"
            >
              {group.map((item) => {
                const isActive = activeStates?.[itemIndex++] ?? false;
                return (
                  // Toolbar toggles are a segmented control, not action buttons, so they stay plain <button>s.
                  <button
                    key={item.label}
                    type="button"
                    title={item.label}
                    aria-label={item.label}
                    aria-pressed={isActive}
                    disabled={!editor}
                    onClick={() => editor && item.run(editor)}
                    className={`rounded-md p-1.5 transition ${
                      isActive
                        ? "bg-claude/10 text-claude dark:bg-claude/20"
                        : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    <item.icon size={14} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
