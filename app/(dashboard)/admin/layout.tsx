import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth/session"

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
    <div>
      <div className="border-b bg-muted/40 px-6 py-3">
        <p className="text-sm font-medium text-muted-foreground">
          Admin Panel — restricted area
        </p>
      </div>
      {children}
    </div>
  )
}
