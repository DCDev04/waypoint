"use client"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"

type Props = {
  content: string
  onChangeCallback?: (content: string) => void
  editable?: boolean
}

export function WorkflowEditor({
  content,
  onChangeCallback,
  editable = true,
}: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true, // clicking a link opens it
        autolink: true, // auto-detects URLs as you type
        defaultProtocol: "https",
      }),
      Placeholder.configure({
        placeholder: "Start writing your workflow steps...",
      }),
    ],
    content,
    editable,
    immediatelyRender: false, // ← required for Next.js SSR
    onUpdate: ({ editor }) => {
      onChangeCallback?.(editor.getHTML())
    },
  })

  return (
    <div className="overflow-hidden rounded-lg border">
      {/* Toolbar — only show when editable */}
      {editable && editor && (
        <div className="flex flex-wrap gap-1 border-b bg-muted/40 p-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            label="B"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            label="I"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            active={editor.isActive("heading", { level: 2 })}
            label="H2"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            active={editor.isActive("heading", { level: 3 })}
            label="H3"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            label="• List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            label="1. List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive("codeBlock")}
            label="Code"
          />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt("Enter URL")
              if (url) editor.chain().focus().setLink({ href: url }).run()
            }}
            active={editor.isActive("link")}
            label="Link"
          />
        </div>
      )}

      {/* Editor body */}
      <EditorContent
        editor={editor}
        className="prose prose-sm min-h-[300px] max-w-none p-4 focus-within:outline-none dark:prose-invert dark:prose-headings:text-white dark:prose-p:text-white dark:prose-blockquote:text-gray-300 dark:prose-strong:text-white dark:prose-li:text-white"
      />
    </div>
  )
}

// Small reusable toolbar button
function ToolbarButton({
  onClick,
  active,
  label,
}: {
  onClick: () => void
  active: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-sm transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  )
}
