// app/(dashboard)/page.tsx
import { getSessionUser } from "@/lib/auth/session"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { workflows } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  // Quick stats
  const allWorkflows = await db.select().from(workflows)
  const published = allWorkflows.filter((w) => w.status === "PUBLISHED").length
  const pending = allWorkflows.filter((w) => w.status === "PENDING").length
  const draft = allWorkflows.filter((w) => w.status === "DRAFT").length

  const stats = [
    { label: "Published", value: published, color: "text-green-600" },
    { label: "Pending", value: pending, color: "text-yellow-600" },
    { label: "Drafts", value: draft, color: "text-muted-foreground" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground capitalize">
          {user.role.toLowerCase()} · {user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="space-y-1 rounded-lg border p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          Quick links
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/workflows"
            className="rounded-lg border p-4 transition-colors hover:bg-accent"
          >
            <p className="font-medium">Browse Workflows</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Search and filter all workflows
            </p>
          </Link>
          {user.role !== "REPRESENTATIVE" && (
            <Link
              href="/workflows/new"
              className="rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <p className="font-medium">New Workflow</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Create a draft workflow
              </p>
            </Link>
          )}
          {user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="rounded-lg border p-4 transition-colors hover:bg-accent"
            >
              <p className="font-medium">Admin Panel</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Manage users and departments
              </p>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
