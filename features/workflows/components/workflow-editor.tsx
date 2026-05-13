// features/workflows/components/workflow-editor.tsx

"use client"

import { BubbleMenu } from "@tiptap/react/menus"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import ImageResize from "tiptap-extension-resize-image" // ← replaces @tiptap/extension-image
import GlobalDragHandle from "tiptap-extension-global-drag-handle"
import { useUploadThing } from "@/lib/uploadthing"
import { useRef, useState } from "react"

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
  const imageInputRef = useRef<HTMLInputElement>(null)
  const replaceImageInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Capture the selected image's position BEFORE any async operation
  // so we can still target it after the upload finishes
  const pendingReplacePos = useRef<number | null>(null)

  const { startUpload } = useUploadThing("workflowImageUploader")

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: "https",
      }),
      Placeholder.configure({
        placeholder: "Start writing your workflow steps...",
      }),
      ImageResize.configure({
        // ← free resize — drag handles appear on image corners when selected
        minWidth: 100,
        maxWidth: 800,
        inline: false,
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4 border",
        },
      }),
      ...(editable
        ? [
            GlobalDragHandle.configure({
              dragHandleWidth: 20,
              scrollTreshold: 100,
            }),
          ]
        : []),
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: [
          "prose prose-sm max-w-none w-full",
          "focus:outline-none",
          "min-h-[400px] px-5 py-4",
          "dark:prose-invert dark:prose-headings:text-white",
          "dark:prose-p:text-white dark:prose-strong:text-white",
          "dark:prose-li:text-white",
        ].join(" "),
      },
    },
    onUpdate: ({ editor }) => {
      onChangeCallback?.(editor.getHTML())
    },
  })

  // ── Insert new image ────────────────────────────────────────────────────────
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    setUploadingImage(true)
    const uploaded = await startUpload([file])

    if (uploaded?.[0]?.ufsUrl) {
      editor.chain().focus().setImage({ src: uploaded[0].ufsUrl }).run()
    }

    setUploadingImage(false)
    e.target.value = ""
  }

  // ── Replace selected image ──────────────────────────────────────────────────
  function triggerReplace() {
    if (!editor) return
    // Snapshot the position NOW — before the file dialog opens and
    // before any async work starts, while the image is still selected
    pendingReplacePos.current = editor.state.selection.from
    replaceImageInputRef.current?.click()
  }

  async function handleReplaceImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return

    // Use the position we captured when the user clicked "Replace"
    const targetPos = pendingReplacePos.current
    if (targetPos === null) return

    setUploadingImage(true)
    const uploaded = await startUpload([file])

    if (uploaded?.[0]?.ufsUrl) {
      const node = editor.state.doc.nodeAt(targetPos)

      if (node && node.type.name === "image") {
        // Dispatch a transaction directly to the exact node position
        // This works even if editor focus/selection changed during upload
        const tr = editor.state.tr.setNodeMarkup(targetPos, undefined, {
          ...node.attrs,
          src: uploaded[0].ufsUrl,
        })
        editor.view.dispatch(tr)
      }
    }

    pendingReplacePos.current = null
    setUploadingImage(false)
    e.target.value = ""
  }

  // ── Delete selected image ───────────────────────────────────────────────────
  function handleDeleteImage() {
    editor?.chain().focus().deleteSelection().run()
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border bg-background">
      {/* Toolbar */}
      {editable && editor && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-muted/40 px-2 py-1.5">
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              label="B"
              title="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              label="I"
              title="Italic"
            />
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor.isActive("heading", { level: 2 })}
              label="H2"
              title="Heading 2"
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor.isActive("heading", { level: 3 })}
              label="H3"
              title="Heading 3"
            />
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              label="• List"
              title="Bullet list"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              label="1. List"
              title="Numbered list"
            />
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              active={editor.isActive("codeBlock")}
              label="Code"
              title="Code block"
            />
            <ToolbarButton
              onClick={() => {
                const url = window.prompt("Enter URL")
                if (url) editor.chain().focus().setLink({ href: url }).run()
              }}
              active={editor.isActive("link")}
              label="Link"
              title="Insert link"
            />
          </ToolbarGroup>
          <ToolbarDivider />
          <ToolbarGroup>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <ToolbarButton
              onClick={() => imageInputRef.current?.click()}
              active={false}
              label="Image"
              title="Upload image"
              disabled={uploadingImage}
            />
          </ToolbarGroup>

          {uploadingImage && (
            <div className="ml-2 flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-xs text-muted-foreground">
                Uploading...
              </span>
            </div>
          )}
        </div>
      )}
      {/* Image BubbleMenu */}
      {editable && editor && (
        <BubbleMenu
          editor={editor}
          shouldShow={({ editor }) => editor.isActive("image")}
        >
          <input
            ref={replaceImageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleReplaceImage}
          />

          <div className="flex items-center gap-1 rounded-lg border bg-background px-1.5 py-1 shadow-lg">
            <button
              type="button"
              onClick={triggerReplace} // ← captures pos synchronously, THEN opens file dialog
              disabled={uploadingImage}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium transition-colors hover:bg-accent disabled:opacity-50"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {uploadingImage ? "Uploading..." : "Replace"}
            </button>

            <div className="h-4 w-px bg-border" />

            <button
              type="button"
              onClick={handleDeleteImage}
              className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </BubbleMenu>
      )}

      <EditorContent
        editor={editor}
        className="w-full flex-1 cursor-text"
        onClick={() => editor?.commands.focus()}
      />

      <style>{`
        .drag-handle {
          position: fixed; opacity: 1; transition: opacity ease-in 0.2s;
          border-radius: 0.25rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(0,0,0,0.5)'%3E%3Cpath d='M3,2 C2.44772,2 2,1.55228 2,1 C2,0.44772 2.44772,0 3,0 C3.55228,0 4,0.44772 4,1 C4,1.55228 3.55228,2 3,2 Z M3,6 C2.44772,6 2,5.55228 2,5 C2,4.44772 2.44772,4 3,4 C3.55228,4 4,4.44772 4,5 C4,5.55228 3.55228,6 3,6 Z M3,10 C2.44772,10 2,9.55228 2,9 C2,8.44772 2.44772,8 3,8 C3.55228,8 4,8.44772 4,9 C4,9.55228 3.55228,10 3,10 Z M7,2 C6.44772,2 6,1.55228 6,1 C6,0.44772 6.44772,0 7,0 C7.55228,0 8,0.44772 8,1 C8,1.55228 7.55228,2 7,2 Z M7,6 C6.44772,6 6,5.55228 6,5 C6,4.44772 6.44772,4 7,4 C7.55228,4 8,4.44772 8,5 C8,5.55228 7.55228,6 7,6 Z M7,10 C6.44772,10 6,9.55228 6,9 C6,8.44772 6.44772,8 7,8 C7.55228,8 4,8.44772 4,9 C4,9.55228 3.55228,10 3,10 Z'%3E%3C/path%3E%3C/svg%3E");
          background-size: calc(0.5em + 0.375rem) calc(0.5em + 0.375rem);
          background-repeat: no-repeat; background-position: center;
          width: 1.2rem; height: 1.5rem; z-index: 50; cursor: grab;
        }
        .drag-handle:hover { background-color: hsl(var(--accent)); }
        .drag-handle:active { cursor: grabbing; }
        .drag-handle.hide { opacity: 0; pointer-events: none; }
        @media (prefers-color-scheme: dark) {
          .drag-handle {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' style='fill: rgba(255,255,255,0.5)'%3E%3Cpath d='M3,2 C2.44772,2 2,1.55228 2,1 C2,0.44772 2.44772,0 3,0 C3.55228,0 4,0.44772 4,1 C4,1.55228 3.55228,2 3,2 Z M3,6 C2.44772,6 2,5.55228 2,5 C2,4.44772 2.44772,4 3,4 C3.55228,4 4,4.44772 4,5 C4,5.55228 3.55228,6 3,6 Z M3,10 C2.44772,10 2,9.55228 2,9 C2,8.44772 2.44772,8 3,8 C3.55228,8 4,8.44772 4,9 C4,9.55228 3.55228,10 3,10 Z M7,2 C6.44772,2 6,1.55228 6,1 C6,0.44772 6.44772,0 7,0 C7.55228,0 8,0.44772 8,1 C8,1.55228 7.55228,2 7,2 Z M7,6 C6.44772,6 6,5.55228 6,5 C6,4.44772 6.44772,4 7,4 C7.55228,4 8,4.44772 8,5 C8,5.55228 7.55228,6 7,6 Z M7,10 C6.44772,10 6,9.55228 6,9 C6,8.44772 6.44772,8 7,8 C7.55228,8 4,8.44772 4,9 C4,9.55228 3.55228,10 3,10 Z'%3E%3C/path%3E%3C/svg%3E");
          }
        }
      `}</style>
    </div>
  )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px bg-border" />
}

function ToolbarButton({
  onClick,
  active,
  label,
  title,
  disabled,
}: {
  onClick: () => void
  active: boolean
  label: string
  title?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`rounded px-2 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  )
}
