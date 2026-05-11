// features/workflows/components/workflow-form.tsx

"use client"

import { useState } from "react"
import { WorkflowEditor } from "./workflow-editor"
import { createWorkflow, updateWorkflow } from "../actions"

type Props = {
  workflowId?: string // if present = edit mode
  initialTitle?: string
  initialContent?: string
  departments: { id: string; name: string }[]
}

export function WorkflowForm({
  workflowId,
  initialTitle = "",
  initialContent = "",
  departments,
}: Props) {
  const [content, setContent] = useState(initialContent)
  const isEditing = !!workflowId

  async function handleSubmit(formData: FormData) {
    formData.set("content", content)

    if (isEditing) {
      await updateWorkflow(workflowId, formData)
    } else {
      await createWorkflow(formData)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <input
          name="title"
          defaultValue={initialTitle}
          placeholder="e.g. Customer Refund Process"
          className="w-full rounded-md border px-3 py-2 text-sm"
          required
        />
      </div>

      {!isEditing && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Department</label>
          <select
            name="departmentId"
            className="w-full rounded-md border px-3 py-2 text-sm"
            required
          >
            <option value="">Select a department...</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">Content</label>
        <WorkflowEditor content={content} onChange={setContent} />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
        >
          {isEditing ? "Save Changes" : "Create Workflow"}
        </button>
      </div>
    </form>
  )
}
