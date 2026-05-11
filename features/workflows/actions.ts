// features/workflows/actions.ts

"use server"

import { db } from "@/lib/db"
import { workflows, workflowVersions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import {
  requireAuth,
  requireAdminOrDeveloper,
  requireRole,
} from "@/lib/auth/session"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// ─── CREATE ──────────────────────────────────────────────────────────────────

export async function createWorkflow(formData: FormData) {
  const user = await requireAdminOrDeveloper()

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const departmentId = formData.get("departmentId") as string

  if (!title || !departmentId) {
    return { error: "Title and department are required." }
  }

  const [workflow] = await db
    .insert(workflows)
    .values({
      title,
      content: content ?? "",
      status: "DRAFT",
      version: "1",
      departmentId,
      createdBy: user.id,
    })
    .returning()

  revalidatePath("/workflows")
  redirect(`/workflows/${workflow.id}/edit`)
}

// ─── UPDATE (DRAFT ONLY) ──────────────────────────────────────────────────────

export async function updateWorkflow(id: string, formData: FormData) {
  const user = await requireAdminOrDeveloper()

  const [existing] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, id))
    .limit(1)

  if (!existing) return { error: "Workflow not found." }

  // Only allow editing DRAFT or REJECTED workflows
  if (!["DRAFT", "REJECTED"].includes(existing.status)) {
    return { error: "Only draft or rejected workflows can be edited." }
  }

  await db
    .update(workflows)
    .set({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      updatedAt: new Date(),
    })
    .where(eq(workflows.id, id))

  revalidatePath(`/workflows/${id}`)
  return { success: true }
}

// ─── SUBMIT FOR APPROVAL ──────────────────────────────────────────────────────
// DRAFT → PENDING

export async function submitForApproval(id: string) {
  const user = await requireAdminOrDeveloper()

  const [existing] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, id))
    .limit(1)

  if (!existing) return { error: "Workflow not found." }
  if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
    return { error: "Only draft or rejected workflows can be submitted." }
  }

  await db
    .update(workflows)
    .set({ status: "PENDING", updatedAt: new Date() })
    .where(eq(workflows.id, id))

  revalidatePath(`/workflows/${id}`)
  revalidatePath("/workflows")
  return { success: true }
}

// ─── APPROVE ─────────────────────────────────────────────────────────────────
// PENDING → PUBLISHED

export async function approveWorkflow(id: string) {
  const user = await requireRole("ADMIN")

  const [existing] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, id))
    .limit(1)

  if (!existing) return { error: "Workflow not found." }
  if (existing.status !== "PENDING") {
    return { error: "Only pending workflows can be approved." }
  }

  // Bump version number
  const newVersion = String(parseInt(existing.version) + 1)

  // Save a version snapshot before publishing
  await db.insert(workflowVersions).values({
    workflowId: id,
    content: existing.content,
    versionNumber: newVersion,
    createdBy: user.id,
  })

  await db
    .update(workflows)
    .set({
      status: "PUBLISHED",
      version: newVersion,
      approvedBy: user.id,
      updatedAt: new Date(),
    })
    .where(eq(workflows.id, id))

  revalidatePath(`/workflows/${id}`)
  revalidatePath("/workflows")
  return { success: true }
}

// ─── REJECT ───────────────────────────────────────────────────────────────────
// PENDING → REJECTED

export async function rejectWorkflow(id: string, reason: string) {
  await requireRole("ADMIN")

  const [existing] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, id))
    .limit(1)

  if (!existing) return { error: "Workflow not found." }
  if (existing.status !== "PENDING") {
    return { error: "Only pending workflows can be rejected." }
  }

  // Store rejection reason in content temporarily so dev can see it
  await db
    .update(workflows)
    .set({
      status: "REJECTED",
      updatedAt: new Date(),
    })
    .where(eq(workflows.id, id))

  revalidatePath(`/workflows/${id}`)
  revalidatePath("/workflows")
  return { success: true }
}
