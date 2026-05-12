import { getSessionUser } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { departments } from "@/lib/db/schema"
import { WorkflowForm } from "@/features/workflows/components/workflow-form"

export default async function NewWorkflowPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  // Only admins and developers can create
  if (user.role === "REPRESENTATIVE") redirect("/workflows")

  const allDepartments = await db.select().from(departments)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Workflow</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a draft workflow. You can submit it for approval when ready.
        </p>
      </div>

      <div className="rounded-lg border p-6">
        <WorkflowForm departments={allDepartments} />
      </div>
    </div>
  )
}
