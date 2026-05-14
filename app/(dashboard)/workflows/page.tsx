// app/(dashboard)/workflows/page.tsx

import { getSessionUser } from "@/lib/auth/session"
import { getWorkflows } from "@/features/workflows/queries"
import { db } from "@/lib/db"
import { departments } from "@/lib/db/schema"
import { WorkflowStatusBadge } from "@/features/workflows/components/workflow-status-badge"
import { RoleGate } from "@/features/auth/components/role-gate"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { WorkflowFilters } from "@/features/workflows/components/workflow-filter"
import { SearchHighlight } from "@/features/workflows/components/search.highlight"
import { WorkflowStatus } from "@/features/workflows/types"
import { getDevelopers } from "@/features/auth/queries"

type Props = {
  searchParams: Promise<{
    q?: string
    status?: string
    dept?: string
  }>
}

export default async function WorkflowsPage({ searchParams }: Props) {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  const { q, dept, status } = await searchParams
  const [allDepartments, workflows, developersName] = await Promise.all([
    db.select().from(departments),
    getWorkflows(user.id, user.role, user.departmentId ?? null, {
      query: q,
      status: status,
      departmentId: dept,
    }),
    getDevelopers(),
  ])

  const hasActiveSearch = !!(q || status || dept)

  return (
    <div className="mx-auto w-3/4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {workflows.length} result{workflows.length !== 1 ? "s" : ""}
            {hasActiveSearch ? " matching your filters" : ""}
          </p>
        </div>
        <RoleGate allowedRoles={["ADMIN", "DEVELOPER"]}>
          <Link
            href="/workflows/new"
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            New Workflow
          </Link>
        </RoleGate>
      </div>

      {/* Filters — wrapped in Suspense because useSearchParams needs it */}
      <Suspense
        fallback={<div className="h-10 animate-pulse rounded-md bg-muted" />}
      >
        <WorkflowFilters departments={allDepartments} userRole={user.role} />
      </Suspense>

      {/* Results */}
      <div className="divide-y rounded-lg border">
        {workflows.length > 0 ? (
          workflows.map((workflow) => (
            <Link
              key={workflow.id}
              href={`/workflows/${workflow.id}`}
              className="flex items-center justify-between p-4 transition-colors hover:bg-accent"
            >
              <div className="min-w-0 space-y-1">
                <p className="truncate font-medium">
                  <SearchHighlight text={workflow.title} query={q} />
                </p>
                <p className="text-xs text-muted-foreground">
                  v{workflow.version} · Updated{" "}
                  {new Date(workflow.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <RoleGate allowedRoles={["ADMIN", "DEVELOPER"]}>
                  <p className="text-xs text-muted-foreground">
                    Created by:{" "}
                    {
                      developersName.find((d) => d.id === workflow.createdBy)
                        ?.name
                    }
                  </p>
                </RoleGate>
              </div>
              <WorkflowStatusBadge status={workflow.status as WorkflowStatus} />
            </Link>
          ))
        ) : (
          <div className="space-y-2 p-12 text-center">
            <p className="text-muted-foreground">
              {hasActiveSearch
                ? `No workflows found for "${q ?? ""}"`
                : "No workflows yet."}
            </p>
            {hasActiveSearch && (
              <Link
                href="/workflows"
                className="text-sm text-primary hover:underline"
              >
                Clear filters
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
