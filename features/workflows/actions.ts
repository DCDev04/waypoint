"use server"

import { db } from "@/lib/db"
import { workflows, workflowVersions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import {
  requireAuth,
  requireAdminOrDeveloper,
  requireRole,
} from "@/lib/auth/session"
import { revalidatePath, updateTag } from "next/cache"
import { redirect } from "next/navigation"
import { ActionResult } from "./types"
import { workflowSchema } from "./schema"

// ─── CREATE ──────────────────────────────────────────────────────────────────
export type WorkflowActionState = {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
}

export async function createWorkflow(
  prevState: WorkflowActionState,
  formData: FormData
): Promise<WorkflowActionState> {
  try {
    const user = await requireAdminOrDeveloper()

    const raw = {
      title: formData.get("title") as string,
      departmentId: formData.get("departmentId") as string,
      content: formData.get("content") as string,
    }

    // Validate with Zod on the server too — never trust the client
    const parsed = workflowSchema.safeParse(raw)

    if (!parsed.success) {
      return {
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    const [workflow] = await db
      .insert(workflows)
      .values({
        title: parsed.data.title,
        content: parsed.data.content,
        departmentId: parsed.data.departmentId,
        status: "DRAFT",
        version: "1",
        createdBy: user.id,
      })
      .returning()

    updateTag("workflows")
    redirect(`/workflows/${workflow.id}`)
  } catch (err: unknown) {
    const error = err as NextRedirectError

    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw err
    }

    return { error: "Failed to create workflow. Please try again." }
  }
}

// ─── UPDATE (DRAFT ONLY) ──────────────────────────────────────────────────────
type NextRedirectError = {
  digest?: string
}
export async function updateWorkflow(
  id: string,
  prevState: WorkflowActionState,
  formData: FormData
): Promise<WorkflowActionState> {
  try {
    await requireAdminOrDeveloper()

    const raw = {
      title: formData.get("title") as string,
      departmentId: (formData.get("departmentId") as string) ?? "placeholder", // not edited
      content: formData.get("content") as string,
    }

    const parsed = workflowSchema.safeParse(raw)

    if (!parsed.success) {
      return {
        fieldErrors: parsed.error.flatten().fieldErrors,
      }
    }

    const [existing] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, id))
      .limit(1)

    if (!existing) return { error: "Workflow not found." }

    if (!["DRAFT", "REJECTED"].includes(existing.status)) {
      return { error: "Only draft or rejected workflows can be edited." }
    }

    await db
      .update(workflows)
      .set({
        title: parsed.data.title,
        content: parsed.data.content,
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, id))

    updateTag(`workflow-${id}`)
    redirect(`/workflows/${id}`)
  } catch (err: unknown) {
    const error = err as NextRedirectError

    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw err
    }

    return { error: "Failed to update workflow. Please try again." }
  }
}

// ─── SUBMIT FOR APPROVAL ──────────────────────────────────────────────────────
// DRAFT → PENDING

export async function submitForApproval(id: string): Promise<ActionResult> {
  const user = await requireAdminOrDeveloper()
  await new Promise((r) => setTimeout(r, 350))
  const [existing] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, id))
    .limit(1)

  if (!existing) return { success: false, error: "Workflow not found." }
  if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
    return {
      success: false,
      error: "Only draft or rejected workflows can be submitted.",
    }
  }

  if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
    return {
      success: false,
      error: "Only draft or rejected workflows can be submitted.",
    }
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

export async function approveWorkflow(id: string): Promise<ActionResult> {
  const user = await requireRole("ADMIN")

  const [existing] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, id))
    .limit(1)

  if (!existing) return { success: false, error: "Workflow not found." }
  if (existing.status !== "PENDING") {
    return { success: false, error: "Only pending workflows can be approved." }
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

export async function rejectWorkflow(
  id: string,
  reason: string
): Promise<ActionResult> {
  await requireRole("ADMIN")

  const [existing] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.id, id))
    .limit(1)

  if (!existing) return { success: false, error: "Workflow not found." }
  if (existing.status !== "PENDING") {
    return { success: false, error: "Only pending workflows can be rejected." }
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
