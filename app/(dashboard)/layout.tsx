// app/(dashboard)/layout.tsx

import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth/session"
import { SidebarNav } from "@/components/layouts/sidebar-nav"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Layer 2: Always re-verify — never trust the proxy alone
  const user = await getSessionUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen">
      {/* Nav is aware of role — shows/hides items accordingly */}
      <SidebarNav user={user} />

      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
