"use client";

import { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
  initialContent: Record<string, unknown>;
  onChange: (content: Record<string, unknown>) => void;
};

export default function TopicEditor({
  initialContent,
  onChange,
}: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.commands.setContent(initialContent);
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#e7e1d8] bg-white">
      <div className="flex flex-wrap gap-2 border-b border-[#e7e1d8] p-3">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
          className={`rounded px-3 py-1.5 text-sm ${
            editor.isActive("bold")
              ? "bg-[#2c2925] text-white"
              : "bg-[#f3efe8] text-[#2c2925]"
          }`}
        >
          Bold
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
          className={`rounded px-3 py-1.5 text-sm ${
            editor.isActive("italic")
              ? "bg-[#2c2925] text-white"
              : "bg-[#f3efe8] text-[#2c2925]"
          }`}
        >
          Italic
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
          className={`rounded px-3 py-1.5 text-sm ${
            editor.isActive("heading", { level: 2 })
              ? "bg-[#2c2925] text-white"
              : "bg-[#f3efe8] text-[#2c2925]"
          }`}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          className="rounded bg-[#f3efe8] px-3 py-1.5 text-sm text-[#2c2925]"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          className="rounded bg-[#f3efe8] px-3 py-1.5 text-sm text-[#2c2925]"
        >
          1. List
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="tiptap min-h-[400px] px-5 py-5 text-[#2c2925]"
      />
    </div>
  );
}