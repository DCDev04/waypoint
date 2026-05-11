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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar stays fixed */}
      <aside className="sticky top-0 flex h-screen">
        <SidebarNav user={user} />
      </aside>

      {/* Only main content scrolls */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
