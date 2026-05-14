import {
  LayoutDashboard,
  PenBox,
  Plus,
  PlusSquare,
  Sparkles,
  UserPen,
  Users,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SessionUser } from "@/lib/auth/session"
import { NavLinks } from "../ui/navbar"

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/admin",
    icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: <Users className="mr-2 h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    label: "Editor",
    href: "/workflows",
    icon: <PenBox className="mr-2 h-4 w-4" />,
    roles: ["ADMIN"],
  },

  {
    label: "Assign Tasks",
    href: "/admin/task",
    icon: <UserPen className="mr-2 h-4 w-4" />,
    roles: ["ADMIN"],
  },
  {
    label: "Approve Workflow",
    href: "/admin/approval",
    icon: <PlusSquare className="mr-2 h-4 w-4" />,
    roles: ["ADMIN"],
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

      <div className="border-t p-4">
        <Card className="rounded-2xl border-dashed shadow-none">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              Quick action
            </div>
            <p className="text-sm text-muted-foreground">
              Create a new workflow or assign a task to a developer in seconds.
            </p>
            <Button className="mt-4 w-full rounded-2xl">
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}
