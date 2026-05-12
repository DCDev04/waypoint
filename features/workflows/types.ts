export type WorkflowStatus = "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED"

export type Workflow = {
  id: string
  title: string
  content: string
  status: WorkflowStatus
  version: string
  departmentId: string
  createdBy: string
  approvedBy: string | null
  createdAt: Date
  updatedAt: Date
}

export type WorkflowWithMeta = Workflow & {
  department: { name: string; slug: string }
  author: { name: string; email: string }
}

export type ActionResult = { success: true } | { success: false; error: string }
