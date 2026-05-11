// app/unauthorized/page.tsx

import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You don&apos;t have permission to view this page.
        </p>
        <Link
          href="/workflows"
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to Workflows
        </Link>
      </div>
    </div>
  )
}
