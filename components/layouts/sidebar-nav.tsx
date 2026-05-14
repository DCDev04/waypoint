import type { SessionUser } from "@/lib/auth/session"
import { SignOutButton } from "@/features/auth/components/sign-out"
import { NavLinks } from "../ui/navbar"
import { LayoutDashboard, PenBox, Settings, Workflow } from "lucide-react"

const NAV_ITEMS = [
  {
    label: "Admin Panel",
    href: "/admin",
    roles: ["ADMIN"],
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
  },
  {
    label: "Workflows",
    href: "/workflows",
    roles: ["ADMIN", "DEVELOPER", "REPRESENTATIVE"],
    icon: <Workflow className="mr-2 h-4 w-4" />,
  },
  {
    label: "Editor",
    href: "/workflows/new",
    roles: ["ADMIN", "DEVELOPER"],
    icon: <PenBox className="mr-2 h-4 w-4" />,
  },

  {
    label: "Settings",
    href: "/settings",
    roles: ["ADMIN", "DEVELOPER", "REPRESENTATIVE"],
    icon: <Settings className="mr-2 h-4 w-4" />,
  },
]

export function SidebarNav({ user }: { user: SessionUser }) {
  return (
    <aside className="hidden w-72 border-r bg-background/80 backdrop-blur xl:flex xl:flex-col">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
          <LayoutDashboard className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold">Waypoint</p>
          <p className="text-xs text-muted-foreground capitalize">
            {user.role.toLowerCase()} · {user.name}
          </p>
        </div>
      </div>
      <div className="flex-1 space-y-2 p-4">
        <NavLinks navItems={NAV_ITEMS} user={user} />
      </div>
    </aside>
  )
}
