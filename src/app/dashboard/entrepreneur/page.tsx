"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  FolderKanban, DollarSign, Users, Clock,
  ArrowUpRight, MessageSquare, Plus, TrendingUp,
  Sparkles, Loader2, AlertCircle, RefreshCw,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn, formatCurrency, formatDateRelative } from "@/lib/utils"

/* ── Types ── */
interface Project {
  id: string
  title: string
  status: string
  raisedAmount: number
  fundingGoal: number
  createdAt: string
}

interface Investment {
  id: string
  amount: number
  status: string
  createdAt: string
  investor: { id: string; name: string; email: string; image: string | null }
  project: { id: string; title: string }
}

interface Message {
  user: { id: string; name: string; image: string | null }
  lastMessage: { content: string; createdAt: string; senderId: string }
}

interface DashboardData {
  projects: Project[]
  investments: Investment[]
  unreadMessages: number
}

/* ── Status badge config ── */
const statusColors: Record<string, string> = {
  PENDING:  "bg-blue-600/10 text-blue-500 border-blue-600/20",
  APPROVED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  FUNDED:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
}

const investStatusColors: Record<string, string> = {
  PENDING:   "bg-blue-600/10 text-blue-500",
  COMPLETED: "bg-emerald-500/10 text-emerald-400",
  CANCELLED: "bg-red-500/10 text-red-400",
}

export default function EntrepreneurDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const firstName = session?.user?.name?.split(" ")[0] ?? "Entrepreneur"

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  async function fetchDashboard() {
    setLoading(true)
    setError("")
    try {
      const [projectsRes, investmentsRes, messagesRes] = await Promise.all([
        fetch("/api/projects?mine=true"),
        fetch("/api/investments"),
        fetch("/api/messages"),
      ])

      const [projects, investments, messages] = await Promise.all([
        projectsRes.json(),
        investmentsRes.json(),
        messagesRes.json(),
      ])

      // unread = messages received by me (lastMessage.senderId !== my id)
      const unread = Array.isArray(messages)
        ? messages.filter((m: Message) => m.lastMessage.senderId !== session?.user?.id).length
        : 0

      setData({
        projects: Array.isArray(projects) ? projects : [],
        investments: Array.isArray(investments) ? investments : [],
        unreadMessages: unread,
      })
    } catch {
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) fetchDashboard()
  }, [session])

  /* ── Derived stats ── */
  const totalProjects  = data?.projects.length ?? 0
  const totalRaised    = data?.projects.reduce((sum, p) => sum + (p.raisedAmount ?? 0), 0) ?? 0
  const activeInvestors = Array.from(new Set(data?.investments.map(i => i.investor.id))).length
  const pendingProjects = data?.projects.filter(p => p.status === "PENDING").length ?? 0

  const stats = [
    { label: "Total Projects",    value: String(totalProjects),         change: `${totalProjects} total`,         icon: FolderKanban, color: "text-blue-400",   bg: "bg-blue-500/10" },
    { label: "Total Raised",      value: formatCurrency(totalRaised),   change: "across all projects",             icon: DollarSign,   color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Active Investors",  value: String(activeInvestors),       change: `${data?.investments.length ?? 0} investments total`, icon: Users, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Pending Approvals", value: String(pendingProjects),       change: "awaiting review",                icon: Clock,        color: "text-blue-500",   bg: "bg-blue-600/10" },
  ]

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDashboard} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Retry
          </Button>
        </div>
      </div>
    )
  }

  /* ── Empty state helper ── */
  const hasProjects    = (data?.projects.length ?? 0) > 0
  const hasInvestments = (data?.investments.length ?? 0) > 0

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {firstName}! <Sparkles className="inline h-6 w-6 text-blue-500" />
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="group relative overflow-hidden" onClick={() => router.push("/dashboard/entrepreneur/projects")}>
            <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
            New Project
          </Button>
          <Button variant="outline" className="relative" onClick={() => router.push("/dashboard/entrepreneur/messages")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Messages
            {(data?.unreadMessages ?? 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {data?.unreadMessages}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="group border-border transition-colors duration-instant hover:border-ring">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-xs p-3", stat.bg)}>
                    <Icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{stat.value}</p>
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <TrendingUp className="h-3 w-3" />{stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Investments (activity feed) */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Recent Investment Activity</CardTitle>
            <CardDescription>Latest investments on your projects</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {hasInvestments ? (
              <div className="divide-y divide-border">
                {data!.investments.slice(0, 5).map((inv) => {
                  const initials = inv.investor.name?.split(" ").map(n => n[0]).join("").toUpperCase() ?? "?"
                  return (
                    <div key={inv.id} className="group flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted">
                      <Avatar className="h-9 w-9 ring-2 ring-border">
                        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{inv.investor.name}</span>{" "}
                          <span className="text-muted-foreground">invested in</span>{" "}
                          <span className="font-medium text-primary">{inv.project.title}</span>
                        </p>
                        <p className="mt-0.5 text-sm font-bold">{formatCurrency(inv.amount)}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/60">
                          {formatDateRelative(inv.createdAt)}
                        </p>
                      </div>
                      <Badge className={cn("shrink-0 border text-[10px] font-medium", investStatusColors[inv.status])}>
                        {inv.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                <DollarSign className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm font-medium text-foreground">No investments yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Investments will appear here once investors fund your projects</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions + Project Summary */}
        <div className="space-y-6">
          {/* My Projects summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>My Projects</CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7 px-2"
                  onClick={() => router.push("/dashboard/entrepreneur/projects")}>
                  View all →
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {hasProjects ? (
                <div className="divide-y divide-border">
                  {data!.projects.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{project.title}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(project.raisedAmount)} raised</p>
                      </div>
                      <Badge className={cn("shrink-0 ml-3 border text-[10px]", statusColors[project.status])}>
                        {project.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                  <FolderKanban className="h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-2 text-sm font-medium">No projects yet</p>
                  <Button size="sm" className="mt-3 h-8 text-xs gap-1.5"
                    onClick={() => router.push("/dashboard/entrepreneur/projects")}>
                    <Plus className="h-3.5 w-3.5" /> Create your first project
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {[
                { icon: Plus,           label: "Create New Project",  sub: "Submit a new idea for funding",              href: "/dashboard/entrepreneur/projects",  color: "text-primary",   bg: "bg-primary/10" },
                { icon: MessageSquare,  label: "Check Messages",      sub: `${data?.unreadMessages ?? 0} unread messages`, href: "/dashboard/entrepreneur/messages",  color: "text-violet-400", bg: "bg-violet-500/10" },
                { icon: TrendingUp,     label: "View Analytics",      sub: "Track project performance",                   href: "/dashboard/entrepreneur/analytics", color: "text-blue-500",  bg: "bg-blue-600/10" },
              ].map(({ icon: Icon, label, sub, href, color, bg }) => (
                <Button key={label} variant="outline"
                  className="group h-auto w-full justify-start gap-4 border-border py-4 hover:border-ring hover:bg-muted transition-colors"
                  onClick={() => router.push(href)}>
                  <div className={cn("flex h-9 w-9 items-center justify-center rounded-xs transition-transform group-hover:scale-110", bg)}>
                    <Icon className={cn("h-4 w-4", color)} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{sub}</p>
                  </div>
                  <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
