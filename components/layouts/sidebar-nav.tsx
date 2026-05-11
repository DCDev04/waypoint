import Link from "next/link"
import type { SessionUser } from "@/lib/auth/session"

const NAV_ITEMS = [
  {
    label: "Workflows",
    href: "/workflows",
    roles: ["ADMIN", "DEVELOPER", "REPRESENTATIVE"], // all roles
  },
  {
    label: "Editor",
    href: "/workflows/new",
    roles: ["ADMIN", "DEVELOPER"], // reps can't create
  },
  {
    label: "Admin Panel",
    href: "/admin",
    roles: ["ADMIN"], // admins only
  },
  {
    label: "Settings",
    href: "/settings",
    roles: ["ADMIN", "DEVELOPER", "REPRESENTATIVE"],
  },
]

export function SidebarNav({ user }: { user: SessionUser }) {
  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(user.role)
  )

  return (
    <aside className="flex w-64 flex-col gap-2 border-r bg-background px-4 py-6">
      <div className="mb-6 px-2">
        <p className="text-lg font-semibold">Waypoint</p>
        <p className="text-xs text-muted-foreground capitalize">
          {user.role.toLowerCase()} · {user.name}
        </p>
      </div>

      <nav className="flex flex-col gap-1">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
