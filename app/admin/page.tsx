"use client"

import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Plus,
  Search,
  UserCog,
  Users,
  Workflow,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

const stats = [
  {
    title: "Total Users",
    value: "1,284",
    change: "+12.4%",
    icon: Users,
    description: "Active accounts in the system",
  },
  {
    title: "Pending Approval",
    value: "36",
    change: "+8 new",
    icon: CircleAlert,
    description: "Users waiting for admin review",
  },
  {
    title: "Workflow Count",
    value: "92",
    change: "+14 this week",
    icon: Workflow,
    description: "Created workflows and templates",
  },
  {
    title: "Assigned Tasks",
    value: "248",
    change: "18 due today",
    icon: UserCog,
    description: "Tasks currently assigned to developers",
  },
]

const workflowTrend = [
  { name: "Mon", workflows: 10, tasks: 18 },
  { name: "Tue", workflows: 16, tasks: 21 },
  { name: "Wed", workflows: 13, tasks: 24 },
  { name: "Thu", workflows: 22, tasks: 28 },
  { name: "Fri", workflows: 18, tasks: 26 },
  { name: "Sat", workflows: 9, tasks: 14 },
  { name: "Sun", workflows: 12, tasks: 17 },
]

const developerLoad = [
  { name: "Anna", tasks: 18 },
  { name: "Mark", tasks: 12 },
  { name: "Dale", tasks: 22 },
  { name: "Mia", tasks: 15 },
  { name: "Ken", tasks: 9 },
]

const approvals = [
  {
    name: "J. Reyes",
    role: "Rep",
    status: "Needs review",
    time: "5 min ago",
    initials: "JR",
  },
  {
    name: "M. Santos",
    role: "Developer",
    status: "Approved",
    time: "18 min ago",
    initials: "MS",
  },
  {
    name: "A. Cruz",
    role: "User",
    status: "Pending",
    time: "1 hr ago",
    initials: "AC",
  },
]

const tasks = [
  {
    title: "Assign claim review workflow",
    assignee: "Anna",
    priority: "High",
    due: "Today",
  },
  {
    title: "Assign onboarding task set",
    assignee: "Mark",
    priority: "Medium",
    due: "Tomorrow",
  },
  {
    title: "Update HR approval flow",
    assignee: "Mia",
    priority: "Low",
    due: "Fri",
  },
]

function TopBar() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Admin Dashboard</p>
          <h1 className="text-lg font-semibold sm:text-xl">
            Workflow Management Overview
          </h1>
        </div>

        <div className="hidden max-w-sm flex-1 md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users, workflows, tasks..."
              className="rounded-2xl pl-9"
            />
          </div>
        </div>

        <Button variant="outline" size="icon" className="rounded-2xl">
          <Bell className="h-4 w-4" />
        </Button>
        <Button className="rounded-2xl">
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
    </header>
  )
}

function StatCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon
        return (
          <Card key={item.title} className="rounded-2xl shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardDescription>{item.title}</CardDescription>
                <CardTitle className="text-3xl font-semibold">
                  {item.value}
                </CardTitle>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                <span className="font-medium text-foreground">
                  {item.change}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function WorkflowActivityChart() {
  return (
    <Card className="rounded-2xl xl:col-span-2">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Workflow Activity</CardTitle>
            <CardDescription>
              Created workflows and assigned tasks this week
            </CardDescription>
          </div>
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            Last 7 days
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="h-[340px] pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={workflowTrend}>
            <defs>
              <linearGradient id="workflowFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopOpacity={0.35} />
                <stop offset="95%" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="workflows"
              strokeWidth={2}
              fill="url(#workflowFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function DeveloperLoadChart() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>Developer Load</CardTitle>
        <CardDescription>Tasks assigned to each developer</CardDescription>
      </CardHeader>
      <CardContent className="h-[340px] pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={developerLoad}
            layout="vertical"
            margin={{ left: 12 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={false}
              opacity={0.25}
            />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Bar dataKey="tasks" radius={[0, 12, 12, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function DashboardCharts() {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <WorkflowActivityChart />
      <DeveloperLoadChart />
    </div>
  )
}

function PendingApprovals() {
  return (
    <Card className="rounded-2xl lg:col-span-1">
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Users waiting for admin action</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvals.map((item, index) => (
          <div key={item.name}>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/initials/svg?seed=${item.name}`}
                  alt={item.name}
                />
                <AvatarFallback>{item.initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-medium">{item.name}</p>
                  <Badge
                    variant={
                      item.status === "Approved" ? "secondary" : "outline"
                    }
                    className="rounded-full"
                  >
                    {item.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.role} · {item.time}
                </p>
              </div>
            </div>
            {index !== approvals.length - 1 ? (
              <Separator className="mt-4" />
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function TaskQueue() {
  return (
    <Card className="rounded-2xl lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Task Assignment Queue</CardTitle>
          <CardDescription>
            Use this area to quickly assign work to developers
          </CardDescription>
        </div>
        <Button variant="outline" className="rounded-2xl">
          View all tasks
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.title}
            className="rounded-2xl border bg-background p-4"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{task.title}</p>
                  <Badge variant="outline" className="rounded-full">
                    {task.priority}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Assigned to{" "}
                  <span className="font-medium text-foreground">
                    {task.assignee}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <Clock3 className="h-4 w-4" />
                  Due {task.due}
                </div>
                <Button className="rounded-2xl">
                  <UserCog className="mr-2 h-4 w-4" />
                  Reassign
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function AdminNotes() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle>Admin Notes</CardTitle>
          <CardDescription>
            Helpful summary for the current workflow state
          </CardDescription>
        </div>
        <Badge className="rounded-full">Healthy</Badge>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-background p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Approvals completed
          </div>
          <p className="text-2xl font-semibold">124</p>
          <Progress value={74} className="mt-3 h-2" />
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <UserCog className="h-4 w-4 text-blue-500" />
            Active developers
          </div>
          <p className="text-2xl font-semibold">18</p>
          <Progress value={62} className="mt-3 h-2" />
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <CircleAlert className="h-4 w-4 text-amber-500" />
            Needs attention
          </div>
          <p className="text-2xl font-semibold">7</p>
          <Progress value={22} className="mt-3 h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

function MainContent() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <StatCards />
      <DashboardCharts />

      <div className="grid gap-6 lg:grid-cols-3">
        <PendingApprovals />
        <TaskQueue />
      </div>

      <AdminNotes />
    </div>
  )
}

export default function AdminWorkflowDashboard() {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <main className="flex-1">
          <TopBar />
          <MainContent />
        </main>
      </div>
    </div>
  )
}
