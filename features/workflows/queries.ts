import { db } from "@/lib/db"
import { workflows } from "@/lib/db/schema"
import { eq, and, sql } from "drizzle-orm"
import type { UserRole } from "@/lib/auth/session"
import { WorkflowStatus } from "./types"

// Get all workflows scoped by role
export type WorkflowFilters = {
  query?: string
  status?: string
  departmentId?: string
}

export async function getWorkflows(
  userId: string,
  role: UserRole,
  userDepartmentId: string | null,
  filters: WorkflowFilters = {}
) {
  const { query, status, departmentId } = filters

  // Build conditions array — we'll AND them all together
  const conditions = []

  // ── Role-based scoping (always applied) ────────────────────────────────────
  if (role === "REPRESENTATIVE" && userDepartmentId) {
    conditions.push(eq(workflows.departmentId, userDepartmentId))
    conditions.push(eq(workflows.status, "PUBLISHED"))
  } else if (role === "DEVELOPER" && userDepartmentId) {
    conditions.push(eq(workflows.departmentId, userDepartmentId))
  }

  // ── Optional filters ────────────────────────────────────────────────────────

  // Status filter (admin/developer only — reps always see PUBLISHED)
  if (status && role !== "REPRESENTATIVE") {
    conditions.push(eq(workflows.status, status as WorkflowStatus))
  }

  // Department filter (admin only — devs/reps are already scoped)
  if (departmentId && role === "ADMIN") {
    conditions.push(eq(workflows.departmentId, departmentId))
  }

  // Full-text search
  if (query && query.trim().length > 0) {
    const searchTerm = query.trim().split(/\s+/).join(" & ") // "refund policy" → "refund & policy"
    conditions.push(
      sql`to_tsvector('english', coalesce(${workflows.title}, '') || ' ' || coalesce(${workflows.content}, '')) @@ to_tsquery('english', ${searchTerm})`
    )
  }

  const results = await db
    .select({
      id: workflows.id,
      title: workflows.title,
      status: workflows.status,
      version: workflows.version,
      departmentId: workflows.departmentId,
      createdBy: workflows.createdBy,
      updatedAt: workflows.updatedAt,
      // Rank results by relevance when searching
      ...(query
        ? {
            rank: sql<number>`ts_rank(
          to_tsvector('english', coalesce(${workflows.title}, '') || ' ' || coalesce(${workflows.content}, '')),
          to_tsquery('english', ${query.trim().split(/\s+/).join(" & ")})
        )`,
          }
        : {}),
    })
    .from(workflows)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(
      query
        ? sql`ts_rank(
            to_tsvector('english', coalesce(${workflows.title}, '') || ' ' || coalesce(${workflows.content}, '')),
            to_tsquery('english', ${query.trim().split(/\s+/).join(" & ")})
          ) desc`
        : workflows.updatedAt
    )

  return results
}

// Get single workflow by ID
export async function getWorkflowById(id: string) {
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, id))
    .limit(1)

  return workflow ?? null
}

// Get version history for a workflow
export async function getWorkflowVersions(workflowId: string) {
  const { workflowVersions } = await import("@/lib/db/schema")
  return db
    .select()
    .from(workflowVersions)
    .where(eq(workflowVersions.workflowId, workflowId))
    .orderBy(workflowVersions.createdAt)
}
