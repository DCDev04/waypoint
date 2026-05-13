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
import { ActionButton } from "@/features/workflows/components/action-button"

export default async function WorkflowPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const { id } = await params

  const workflow = await getWorkflowById(id)

  if (!workflow) notFound()

  return (
    <div className="mx-auto w-3/4 space-y-6">
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
              <ActionButton
                action={submitForApproval.bind(null, workflow.id)}
                idleText="Submit for Approval"
                pendingText="Submitting..."
                successMessage="Workflow submitted."
              />
            </RoleGate>
          )}

          {/* Approve */}
          {workflow.status === "PENDING" && (
            <RoleGate allowedRoles={["ADMIN"]}>
              <ActionButton
                action={approveWorkflow.bind(null, workflow.id)}
                idleText="Approve"
                pendingText="Approving..."
                successMessage="Workflow approved."
              />
            </RoleGate>
          )}

          {/* Reject */}
          {workflow.status === "PENDING" && (
            <RoleGate allowedRoles={["ADMIN"]}>
              <ActionButton
                action={rejectWorkflow.bind(null, workflow.id, "need revision")}
                idleText="Reject"
                pendingText="Rejecting..."
                successMessage="Workflow Reject. reasson: need revision "
              />
            </RoleGate>
          )}
        </div>
      </div>

      {/* Read-only editor — renders content safely */}
      <WorkflowEditor content={workflow.content} editable={false} />
    </div>
  )
}
