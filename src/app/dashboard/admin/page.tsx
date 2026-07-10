"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, Briefcase, DollarSign, Clock, ArrowUpRight, UserCheck, FileText, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatCurrency, formatDateRelative } from "@/lib/utils"

interface Stats { totalUsers: number; totalProjects: number; totalInvestments: number; pendingProjects: number; totalFunding: number }
interface RecentUser { id: string; name: string; email: string; role: string; createdAt: string }
interface RecentInvestment { id: string; amount: number; status: string; createdAt: string; investor: { name: string }; project: { title: string } }

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats]       = useState<Stats | null>(null)
  const [users, setUsers]       = useState<RecentUser[]>([])
  const [investments, setInvs]  = useState<RecentInvestment[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")

  async function load() {
    setLoading(true); setError("")
    try {
      const [usersRes, projectsRes, investmentsRes] = await Promise.all([
        fetch("/api/users?limit=5"),
        fetch("/api/projects?mine=false&limit=5"),
        fetch("/api/investments"),
      ])
      const [usersData, projectsData, invData] = await Promise.all([
        usersRes.json(), projectsRes.json(), investmentsRes.json(),
      ])

      const recentUsers = Array.isArray(usersData.users) ? usersData.users : []
      const allInvestments = Array.isArray(invData) ? invData : []

      setUsers(recentUsers)
      setInvs(allInvestments.slice(0, 6))
      setStats({
        totalUsers:      usersData.total ?? 0,
        totalProjects:   Array.isArray(projectsData) ? projectsData.length : (projectsData.total ?? 0),
        totalInvestments: allInvestments.length,
        pendingProjects:  Array.isArray(projectsData) ? projectsData.filter((p: any) => p.status === "PENDING").length : 0,
        totalFunding:    allInvestments.filter((i: any) => i.status === "COMPLETED").reduce((s: number, i: any) => s + i.amount, 0),
      })
    } catch { setError("Failed to load dashboard") }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  if (error)   return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
      <AlertCircle className="h-8 w-8 text-destructive" />
      <p className="text-sm text-muted-foreground">{error}</p>
      <Button variant="outline" size="sm" onClick={load} className="gap-2"><RefreshCw className="h-4 w-4" />Retry</Button>
    </div>
  )

  const statCards = [
    { title: "Total Users",        value: String(stats?.totalUsers ?? 0),           icon: Users,     color: "text-blue-400",    bg: "bg-blue-500/10",    change: "registered" },
    { title: "Total Projects",     value: String(stats?.totalProjects ?? 0),         icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10", change: "submitted" },
    { title: "Total Funding",      value: formatCurrency(stats?.totalFunding ?? 0),  icon: DollarSign,color: "text-violet-400",  bg: "bg-violet-500/10",  change: "completed" },
    { title: "Pending Approvals",  value: String(stats?.pendingProjects ?? 0),        icon: Clock,     color: "text-blue-500",   bg: "bg-blue-600/10",   change: "awaiting review" },
  ]

  const quickActions = [
    { title: "Pending Approvals", desc: `${stats?.pendingProjects ?? 0} items awaiting review`, icon: Clock,     color: "text-blue-500",  bg: "bg-blue-600/10",  href: "/dashboard/admin/projects" },
    { title: "User Management",   desc: `${stats?.totalUsers ?? 0} total users`,                icon: UserCheck, color: "text-blue-400",   bg: "bg-blue-500/10",   href: "/dashboard/admin/users" },
    { title: "View Reports",      desc: "Analytics and insights",                               icon: FileText,  color: "text-violet-400", bg: "bg-violet-500/10", href: "/dashboard/admin/reports" },
  ]

  const invStatusCls: Record<string, string> = {
    COMPLETED: "bg-emerald-500/10 text-emerald-400", PENDING: "bg-blue-600/10 text-blue-500", CANCELLED: "bg-red-500/10 text-red-400",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Overview of platform activity and metrics.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.title} className="group border-border transition-colors hover:border-ring">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("rounded-xs p-3 transition-transform group-hover:scale-110", s.bg)}>
                    <Icon className={cn("h-5 w-5", s.color)} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground/70">{s.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground/40">{s.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-5 lg:grid-cols-3">
        {quickActions.map((a) => {
          const Icon = a.icon
          return (
            <Card key={a.title} className="group cursor-pointer border-border transition-all hover:border-ring hover:-translate-y-1"
              onClick={() => router.push(a.href)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={cn("rounded-xs p-3 transition-transform group-hover:scale-110", a.bg)}>
                    <Icon className={cn("h-5 w-5", a.color)} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="mt-4 font-semibold">{a.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Registrations</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => router.push("/dashboard/admin/users")}>View all →</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No users found.</p>
            ) : (
              <div className="divide-y divide-border">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted transition-colors">
                    <div>
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={cn("text-xs mb-1", u.role === "INVESTOR" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : u.role === "ENTREPRENEUR" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-red-500/10 text-red-400 border-red-500/20")}>
                        {u.role}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground/50">{formatDateRelative(u.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Investments */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Recent Investments</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => router.push("/dashboard/admin/investments")}>View all →</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {investments.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No investments found.</p>
            ) : (
              <div className="divide-y divide-border">
                {investments.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inv.investor.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{inv.project.title}</p>
                    </div>
                    <div className="text-right ml-3 shrink-0">
                      <p className="text-sm font-bold">{formatCurrency(inv.amount)}</p>
                      <Badge className={cn("text-[10px] border-0 mt-0.5", invStatusCls[inv.status] ?? "bg-muted text-muted-foreground")}>{inv.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
