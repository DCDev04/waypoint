// features/workflows/components/workflow-status-badge.tsx

import type { WorkflowStatus } from "../types"

const STATUS_STYLES: Record<WorkflowStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
}

export function WorkflowStatusBadge({ status }: { status: WorkflowStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}
