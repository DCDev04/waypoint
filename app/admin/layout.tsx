import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth/session"
import { SidebarNav } from "@/components/layouts/sidebar-nav-admin"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/unauthorized")
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
