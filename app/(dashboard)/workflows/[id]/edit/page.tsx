// app/(dashboard)/workflows/[id]/edit/page.tsx

import { getSessionUser } from "@/lib/auth/session"
import { redirect, notFound } from "next/navigation"
import { db } from "@/lib/db"
import { departments } from "@/lib/db/schema"
import { getWorkflowById } from "@/features/workflows/queries"
import { WorkflowForm } from "@/features/workflows/components/workflow-form"

export default async function EditWorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getSessionUser()
  if (!user) redirect("/login")

  if (user.role === "REPRESENTATIVE") redirect("/workflows")

  const [workflow, allDepartments] = await Promise.all([
    getWorkflowById(id),
    db.select().from(departments),
  ])

  if (!workflow) notFound()

  // Guard — only editable in these statuses
  if (!["DRAFT", "REJECTED"].includes(workflow.status)) {
    redirect(`/workflows/${id}`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Workflow</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Editing draft — <span className="font-medium">{workflow.title}</span>
        </p>
      </div>

      {workflow.status === "REJECTED" && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This workflow was rejected. Revise and resubmit for approval.
        </div>
      )}

      <div className="rounded-lg border p-6">
        <WorkflowForm
          workflowId={workflow.id}
          defaultValues={{
            title: workflow.title,
            content: workflow.content,
            departmentId: workflow.departmentId,
          }}
          departments={allDepartments}
        />
      </div>
    </div>
  )
}
