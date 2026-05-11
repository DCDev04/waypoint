// features/workflows/components/workflow-filters.tsx

"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
import { useDebouncedCallback } from "use-debounce"

type Department = { id: string; name: string }

type Props = {
  departments: Department[]
  userRole: string
}

const STATUS_OPTIONS = [
  { label: "All Statuses", value: "" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Pending", value: "PENDING" },
  { label: "Draft", value: "DRAFT" },
  { label: "Rejected", value: "REJECTED" },
]

export function WorkflowFilters({ departments, userRole }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Helper to update a single param while keeping the rest
  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      // Reset to page 1 on any filter change
      params.delete("page")
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`)
      })
    },
    [pathname, router, searchParams]
  )

  // Debounce the search input — waits 350ms after user stops typing
  const handleSearch = useDebouncedCallback((value: string) => {
    updateParam("q", value)
  }, 350)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search input */}
      <div className="relative min-w-[220px] flex-1">
        <svg
          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          placeholder="Search workflows..."
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-md border bg-background py-2 pr-3 pl-9 text-sm"
        />
        {isPending && (
          <div className="absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </div>

      {/* Status filter — hidden for representatives */}
      {userRole !== "REPRESENTATIVE" && (
        <select
          defaultValue={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* Department filter — admin only */}
      {userRole === "ADMIN" && (
        <select
          defaultValue={searchParams.get("dept") ?? ""}
          onChange={(e) => updateParam("dept", e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      )}

      {/* Clear filters — only show if any filter is active */}
      {(searchParams.get("q") ||
        searchParams.get("status") ||
        searchParams.get("dept")) && (
        <button
          onClick={() => {
            startTransition(() => router.replace(pathname))
          }}
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
