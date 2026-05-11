import { getSessionUser } from "@/lib/auth/session"
import { getWorkflowById } from "@/features/workflows/queries"
import { WorkflowStatusBadge } from "@/features/workflows/components/workflow-status-badge"
import { WorkflowEditor } from "@/features/workflows/components/workflow-editor"
import { RoleGate } from "@/features/auth/components/role-gate"
import {
  submitForApproval,
  approveWorkflow,
  rejectWorkflow,
} from "@/features/workflows/actions"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { WorkflowStatus } from "@/features/workflows/types"

export default async function WorkflowPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const workflow = await getWorkflowById(params.id)
  if (!workflow) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{workflow.title}</h1>
          <div className="flex items-center gap-3">
            <WorkflowStatusBadge status={workflow.status as WorkflowStatus} />
            <span className="text-xs text-muted-foreground">
              v{workflow.version}
            </span>
          </div>
        </div>

        {/* Action buttons — each gated by role AND current status */}
        <div className="flex shrink-0 gap-2">
          {/* Edit — only for draft/rejected, only for dev+admin */}
          {["DRAFT", "REJECTED"].includes(workflow.status) && (
            <RoleGate allowedRoles={["ADMIN", "DEVELOPER"]}>
              <Link
                href={`/workflows/${workflow.id}/edit`}
                className="rounded-md border px-3 py-1.5 text-sm"
              >
                Edit
              </Link>
            </RoleGate>
          )}

          {/* Submit for approval */}
          {["DRAFT", "REJECTED"].includes(workflow.status) && (
            <RoleGate allowedRoles={["ADMIN", "DEVELOPER"]}>
              <form
                action={() => {
                  submitForApproval.bind(null, workflow.id)
                  // success/error handling here
                }}
              >
                <button
                  type="submit"
                  className="rounded-md bg-yellow-500 px-3 py-1.5 text-sm text-white"
                >
                  Submit for Approval
                </button>
              </form>
            </RoleGate>
          )}

          {/* Approve */}
          {workflow.status === "PENDING" && (
            <RoleGate allowedRoles={["ADMIN"]}>
              <form
                action={() => {
                  approveWorkflow.bind(null, workflow.id)
                  // success/error handling here
                }}
              >
                <button
                  type="submit"
                  className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white"
                >
                  Approve
                </button>
              </form>
            </RoleGate>
          )}

          {/* Reject */}
          {workflow.status === "PENDING" && (
            <RoleGate allowedRoles={["ADMIN"]}>
              <form
                action={() => {
                  rejectWorkflow.bind(null, workflow.id, "need revision") // modify this when we have a dedicate comment for reject for admin | tl
                  // success/error handling here
                }}
              >
                <button
                  type="submit"
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white"
                >
                  Reject
                </button>
              </form>
            </RoleGate>
          )}
        </div>
      </div>

      {/* Read-only editor — renders content safely */}
      <WorkflowEditor
        content={workflow.content}
        onChange={() => {}}
        editable={false}
      />
    </div>
  )
}
